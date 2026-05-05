import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from hexgame.models import *
from hexgame.notifications import send_push_notif
from hexgame.serializers import *
from django.shortcuts import get_object_or_404

@login_required
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

    PushSubscription.objects.update_or_create(
        endpoint=endpoint,
        defaults={
            "p256dh": p256dh,
            "auth": auth,
        },
        user=User.objects.get(username=username)
    )

    return JsonResponse({"status": "success"})

@login_required
def get_game_context(request, game_id):
    game = get_object_or_404(Game, pk=game_id)
    game = GameSerializer(game).data

    return JsonResponse({
        "game": game,
        "logged_in_user": request.user.username,
        "subscribed": request.user.has_subscribed
    })

@login_required
def update_game(request):
    game_id = request.POST.get("game_id")
    game = get_object_or_404(Game, pk=game_id)

    was_admin_update = request.POST.get("admin_update", False)
    player_that_just_won = request.POST.get("playerThatJustWon")
    game_over = True if player_that_just_won else False
    new_cells = request.POST.get("cells")

    game.board_state = json.loads(new_cells)
    player = list(game.players)[game.current_player_turn]

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
    new_player = list(game.players)[game.current_player_turn]
    PlayerEvent.objects.create(player=new_player)

    if not game.archived:
        if PushSubscription.objects.filter(user=player.user).exists():
            send_push_notif(
                player.user, 
                f"Your Turn ({player.user.username}) in game {game.id}",
                f"{player.user.username} made their move.",
                game.id
            )

    game_data = GameSerializer(game).data
    return JsonResponse({'result': 'success', 'game': game_data})
