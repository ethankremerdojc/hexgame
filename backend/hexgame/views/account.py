from django.shortcuts import redirect, render
from hexgame.models import *
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required

def get_games(user, archived):
    players = Player.objects.filter(user=user)
    game_ids = players.values_list('game__id', flat=True)

    games = Game.objects.archived() if archived else Game.objects.non_archived()

    return {
        "own_games": games.filter(id__in=game_ids),
        "other_games": games.exclude(id__in=game_ids).filter(spectatable=True),
    }

@login_required
def home_view(request):
    games = get_games(request.user, archived=False)
    return render(request, "hexgame/home.html", games)

@login_required
def archive_view(request):
    games = get_games(request.user, archived=True)
    return render(request, "hexgame/archive.html", games)

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
