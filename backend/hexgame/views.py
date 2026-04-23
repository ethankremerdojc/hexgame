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
from .models import Game, Player, PushSubscription
from django.contrib.auth.models import User
from pywebpush import webpush, WebPushException
from .serializers import GameSerializer
from backend import settings

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

@login_required
def home_view(request):
    games = (
        Player.objects
        .filter(user=request.user)
        .select_related("game")
    )
    return render(request, "hexgame/account/home.html", {"games": games})

@login_required
def create_game_view(request):
    if request.method == "POST":
        form = CreateGameForm(request.POST)
        if form.is_valid():
            users = form.cleaned_data["usernames"]
            minutes_per_turn = form.cleaned_data["minutes_per_turn"]
            kick_if_inactive = form.cleaned_data["kick_if_inactive"]
            celldata = form.cleaned_data["celldata"]

            with transaction.atomic():
                game = Game.objects.create(
                    current_player_turn=0,
                    board_state=json.loads(celldata),   # or whatever your initial board state should be
                    minutes_per_turn=minutes_per_turn,
                    kick_if_inactive=kick_if_inactive,
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
    return render(request, "hexgame/game/game.html", {"game": game})


def user_has_subscribed(user):
    try:
        return PushSubscription.objects.filter(user=user).exists()
    except:
        return False

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
    view_only = request.GET.get("view_only", False)

    if player_count or view_only:
        react_context = json.dumps({
            "playerCount": player_count,
            # "viewOnly": view_only,
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

    new_cells = request.POST.get("cells")
    new_player_turn = request.POST.get("playerTurn")

    game.board_state = json.loads(new_cells)
    game.current_player_turn = int(new_player_turn)

    if game.current_player_turn == 0:
        game.turn_number += 1

    game.save()

    player = list(game.players)[game.current_player_turn]

    if PushSubscription.objects.filter(user=player.user).exists():
        # print(player.user)
        # print("sending push to above")
        send_test_push(player.user, game.id)

    game_data = GameSerializer(game).data

    return JsonResponse({'result': 'success', 'game': game_data})

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

def send_test_push(user, game_id):
    payload = json.dumps({
        "title": f"Your Turn ({user.username}) in game {game_id}",
        "body": "Last player made their move.",
        "url": "/",
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
    print(resp)
    return JsonResponse(resp)





