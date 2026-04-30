import os, json
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.db import transaction

from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import redirect, render, get_object_or_404
from django.views.decorators.http import require_POST
from backend.settings import BASE_DIR

from .forms import CreateGameForm
from .models import *
from django.contrib.auth.models import User
from pywebpush import webpush, WebPushException
from .serializers import GameSerializer, ChatMessageSerializer
from backend import settings
from django.core.exceptions import PermissionDenied
from django.db.models import Case, When, Value, BooleanField

def register_view(request):
    if request.user.is_authenticated:
        return redirect("home")

    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect("home")
    else:
        form = UserCreationForm()

    return render(request, "hexgame/account/register.html", {"form": form})

def get_games(user, archived):
    players = Player.objects.filter(user=user)
    game_ids = players.values_list('game__id', flat=True)

    games = Game.objects.archived() if archived else Game.objects.non_archived()

    return {
        "own_games": games.filter(id__in=game_ids),
        "other_games": games.exclude(id__in=game_ids),
    }

@login_required
def home_view(request):
    games = get_games(request.user, archived=False)
    return render(request, "hexgame/home.html", games)

@login_required
def archive_view(request):
    games = get_games(request.user, archived=True)
    return render(request, "hexgame/archive.html", games)

@login_required
def create_game_view(request):
    if request.method == "POST":
        form = CreateGameForm(request.POST)
        if form.is_valid():
            users = form.cleaned_data["usernames"]
            minutes_per_turn = form.cleaned_data["minutes_per_turn"]
            # kick_if_inactive = form.cleaned_data["kick_if_inactive"]
            celldata = form.cleaned_data["celldata"]

            with transaction.atomic():
                game = Game.objects.create(
                    current_player_turn=0,
                    board_state=json.loads(celldata),   # or whatever your initial board state should be
                    minutes_per_turn=minutes_per_turn,
                    kick_if_inactive=False,
                    turn_number=1
                )

                # include the creator automatically
                all_users = [request.user]
                for user in users:
                    if user != request.user:
                        all_users.append(user)

                for user in all_users:
                    Player.objects.create(user=user, game=game)

            return redirect("game", game_id=game.id)
    else:
        form = CreateGameForm()

    return render(request, "hexgame/game/create_game.html", {"form": form})

@login_required
def game_view(request, game_id):
    game = get_object_or_404(Game, id=game_id)
    editor_mode = request.GET.get("editorMode")
    return render(request, "hexgame/game/game.html", {"game": game, "editor_mode": editor_mode})


def user_has_subscribed(user):
    try:
        return PushSubscription.objects.filter(user=user).exists()
    except:
        return False

#TODO make this actually login required
# @login_required
def get_game_context(request, game_id):
    game = get_object_or_404(Game, pk=game_id)
    game = GameSerializer(game).data

    return JsonResponse({
        "game": game,
        "logged_in_user": request.user.username,
        "subscribed": user_has_subscribed(request.user)
    })

@login_required
def game_iframe(request):
    index_file = os.path.join(BASE_DIR, "hexgame/static/gameBuild/index.html")

    with open(index_file, "r") as f:
        html = f.read()

    player_count = request.GET.get("player_count")
    cell_count = request.GET.get("cell_count")

    if player_count:
        react_context = json.dumps({
            "playerCount": player_count,
            "cellCount": cell_count
        })

        html = html.replace(
            "</head>",
            f"<script>window.__IFRAME_CONTEXT__ = {react_context};</script></head>"
        )

    return HttpResponse(html)

@login_required
def update_game(request):
    game_id = request.POST.get("game_id")
    game = get_object_or_404(Game, pk=game_id)

    was_admin_update = request.POST.get("admin_update", False)
    player_that_just_won = request.POST.get("playerThatJustWon")
    game_over = True if player_that_just_won else False
    new_cells = request.POST.get("cells")

    game.board_state = json.loads(new_cells)

    if game_over:
        game.complete = True
        game.winner = User.objects.get(username=player_that_just_won)
    else:
        if not was_admin_update:
            new_player_turn = request.POST.get("playerTurn")

            game.current_player_turn = int(new_player_turn)

            if game.current_player_turn == 0:
                game.turn_number += 1

    game.save()

    player = list(game.players)[game.current_player_turn]
    PlayerEvent.objects.create(player=player)
    
    if not game.archived:
        if PushSubscription.objects.filter(user=player.user).exists():
            send_push_notif(
                player.user, 
                f"Your Turn ({user.username}) in game {game.id}",
                "Last player made their move.",
                game.id
            )

    game_data = GameSerializer(game).data
    return JsonResponse({'result': 'success', 'game': game_data})

@login_required
def toggle_archive_game_view(request):
    game_id = request.POST.get("game_id")

    game = get_object_or_404(Game, pk=game_id)
    get_object_or_404(Player, game=game, user=request.user)

    game.archived = not game.archived
    game.save()
    return redirect("home")

#------------- Notifications -------------------

@csrf_exempt
def notification_subscribe_view(request):
    if request.method != "POST":
        return HttpResponseBadRequest("POST required")

    try:
        data = json.loads(request.body)
        username = data["username"]

        sub = data["subscription"]

        print(sub)
        endpoint = sub["endpoint"]
        keys = sub["keys"]
        p256dh = keys["p256dh"]
        auth = keys["auth"]

    except (KeyError, json.JSONDecodeError):

        return HttpResponseBadRequest("Invalid subscription payload")

    #HACK
    if not username:
        username = "admin"

    PushSubscription.objects.update_or_create(
        endpoint=endpoint,
        defaults={
            "p256dh": p256dh,
            "auth": auth,
        },
        user=User.objects.get(username=username)
    )

    return JsonResponse({"status": "success"})

def send_push_notif(user, title, body, game_id):
    payload = json.dumps({
        "title": title,
        "body": body,
        "url": f"/game/{game_id}/",
    })

    sent = 0
    failed = 0

    for sub in PushSubscription.objects.filter(user=user):
        subscription_info = {
            "endpoint": sub.endpoint,
            "keys": {
                "p256dh": sub.p256dh,
                "auth": sub.auth,
            },
        }

        try:
            webpush(
                subscription_info=subscription_info,
                data=payload,
                vapid_private_key=settings.WEBPUSH_VAPID_PRIVATE_KEY,
                vapid_claims={
                    "sub": settings.WEBPUSH_VAPID_ADMIN_EMAIL,
                },
            )
            sent += 1
        except WebPushException:
            failed += 1

    resp = {"sent": sent, "failed": failed}
    return JsonResponse(resp)

# CHAT

@login_required
def get_chat_messages(request, game_id):
    game = get_object_or_404(Game, pk=game_id)
    player = get_object_or_404(Player, game=game, user=request.user)

    return JsonResponse({"messages": ChatMessageSerializer(
        ChatMessage.objects.filter(player__game=game), many=True
    ).data})

@login_required
def post_chat_message(request):
    message = request.POST.get("message")
    game_id = request.POST.get("game_id")
    game = get_object_or_404(Game, pk=game_id)
    player = get_object_or_404(Player, game=game, user=request.user)

    ChatMessage.objects.create(
        player=player,
        message=message
    )

    def trunc(msg):
        if len(msg) > 100:
            return msg[:100]
        return msg

    for p in game.players:
        if p.id == player.id:
            continue
        if PushSubscription.objects.filter(user=p.user).exists():
            send_push_notif(
                player.user, 
                f"New Message in game {game.id}",
                trunc(message),
                game.id
            )

    return get_chat_messages(request, game_id)
