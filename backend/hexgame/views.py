from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.db import transaction
from django.shortcuts import redirect, render, get_object_or_404

from .forms import CreateGameForm
from .models import Game, Player

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

            with transaction.atomic():
                game = Game.objects.create(
                    current_player_turn=0,
                    board_state={},   # or whatever your initial board state should be
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
