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
            title = form.cleaned_data["title"]
            spectatable = form.cleaned_data["spectatable"]
            celldata = form.cleaned_data["celldata"]

            with transaction.atomic():
                game = Game.objects.create(
                    current_player_turn=0,
                    title=title,
                    spectatable=spectatable,
                    board_state=json.loads(celldata),
                    minutes_per_turn=minutes_per_turn,
                    kick_if_inactive=False,
                    turn_number=1,
                    creator=request.user
                )

                for user in users:
                    Player.objects.create(user=user, game=game)

            return redirect("game", game_id=game.id)
    else:
        form = CreateGameForm()

    return render(request, "hexgame/game/create_game.html", {"form": form})

@login_required
def forfeit_or_cancel_view(request, game_id):
    game = get_object_or_404(Game, id=game_id)
    player = get_object_or_404(Player, game=game, user=request.user)

    if not game.turns_have_been_taken:
        game.delete()
        return redirect("home")

    player.forfeited = True
    player.save()

    # if it is this users turn, we need to increment turn.
    
    player_ids = list(game.players.values_list('id', flat=True))
    p_index = player_ids.index(player.id)

    if p_index == game.current_player_turn:
        print("user that forfeited did so on their own turn. incrementing turn num")
        new_index = p_index + 1

        if new_index == game.players.count():
            first_non_forfeited_player = game.get_non_forfeited_players().first()
            new_index == player_ids.index(player.id)
            game.turn_number += 1

        game.current_player_turn = new_index
        game.save()

    non_forfeited_players = game.get_non_forfeited_players()

    if non_forfeited_players.count() == 1:
        print("Only one non forfeited player left, that player wins")
        game.complete = True
        game.winner = non_forfeited_players.first().user
        game.save()

    return redirect("home")

@login_required
def game_view(request, game_id):
    game = get_object_or_404(Game, id=game_id)
    editor_mode = request.GET.get("editorMode")

    if not game.spectatable:
        get_object_or_404(Player, game=game, user=request.user)

    player = None

    try:
        player = Player.objects.get(game=game, user=request.user)
    except:
        pass

    if request.method == "POST":
        game_info_form = GameInfoForm(request.POST)
        if game_info_form.is_valid():
            title = form.cleaned_data["title"]
            spectatable = form.cleaned_data["spectatable"]

            game.title = title
            game.spectatable = spectatable

            game.save()

    else:
        game_info_form = GameInfoForm(instance=game)

    return render(request, "hexgame/game/game.html", {
        "game": game,
        "editor_mode": editor_mode,
        "game_info_form": game_info_form,
        "player_has_made_at_least_one_move": game.player_has_made_at_least_one_move(request.user),
        "player_has_forfeited": player.forfeited if player else False,
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
