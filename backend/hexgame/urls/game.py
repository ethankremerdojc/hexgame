from django.contrib.auth import views as auth_views
from django.urls import path, include
from hexgame.views.game import *

urlpatterns = [
    path("<int:game_id>/", game_view, name="game"),
    path("iframe/", game_iframe, name="game_iframe"),
    path("toggle_archive/", toggle_archive_game_view, name="toggle_archive_game"),
    path("create/", create_game_view, name="create_game")
]
