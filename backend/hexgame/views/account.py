from django.shortcuts import redirect, render
from hexgame.models import *
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from datetime import timedelta
from pprint import pprint

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

def format_timedelta(td):
    hours, remainder = divmod(td.seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    return f"{td.days} days, {hours} hours, {minutes} minutes {seconds} seconds"

def get_game_times(user):

    # For each game, get the game updates for this player, and check time for the time
    # of that update compared to the previous
    
    times = []
    
    events = PlayerEvent.objects.filter(player__user=user)

    for event in events:
        previous_event = event.get_previous_event()

        if not previous_event: # first event
            continue

        times.append(event.timestamp - previous_event.timestamp)

    times = sorted(times)
    return times
    pprint(times)

    # giving datetime.timedelta(0) as the start value makes sum work on tds 
    total_time = sum(times, timedelta(0))

    return {
        "avg": format_timedelta(total_time / len(times)),
        "shortest": format_timedelta(times[0]),
        "longest": format_timedelta(times[-1]),
        "total_time_waiting": format_timedelta(total_time)
    }

def stats_view(request, username):
    player = User.objects.get(username=username)

    all_games = Game.objects.filter(
        id__in=Player.objects.filter(user=player).values_list('game__id', flat=True)
    )

    archived_games = all_games.filter(archived=True)
    non_archived_games = all_games.filter(archived=False)

    return render(request, "hexgame/account/stats.html", {
        "player": player,
        "other_users": User.objects.exclude(id=player.id),
        "games": {
            "archived": archived_games,
            "non_archived": non_archived_games,
            "all": all_games
        },
        "times": get_game_times(player)
    })

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
