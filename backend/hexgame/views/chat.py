from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from hexgame.models import *
from hexgame.serializers import ChatMessageSerializer

@login_required
def get_chat_messages(request, game_id):
    game = get_object_or_404(Game, pk=game_id)
    player = get_object_or_404(Player, game=game, user=request.user)

    return JsonResponse({"messages": ChatMessageSerializer(
        ChatMessage.objects.filter(player__game=game).order_by('timestamp'), many=True
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
