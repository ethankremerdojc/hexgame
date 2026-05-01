import os, json
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render, get_object_or_404
from django.db import transaction
from hexgame.models import *
from hexgame.forms import CreateGameForm, GameInfoForm
from django.http import HttpResponse
from backend.settings import BASE_DIR

@login_required
def toggle_archive_game_view(request):
    game_id = request.POST.get("game_id")

    game = get_object_or_404(Game, pk=game_id)
    get_object_or_404(Player, game=game, user=request.user)

    game.archived = not game.archived
    game.save()
    return redirect("home")

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

    if not game.spectatable:
        get_object_or_404(Player, game=game, user=request.user)

    if request.method == "POST":
        form = GameInfoForm(request.POST)
        if form.is_valid():
            title = form.cleaned_data["title"]
            spectatable = form.cleaned_data["spectatable"]

            game.title = title
            game.spectatable = spectatable

            game.save()

    else:
        form = GameInfoForm(instance=game)

    return render(request, "hexgame/game/game.html", {
        "game": game,
        "editor_mode": editor_mode,
        "form": form
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
