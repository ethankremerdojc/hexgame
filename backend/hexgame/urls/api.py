from django.contrib.auth import views as auth_views
from django.urls import path, include
from hexgame.views.api import *

urlpatterns = [
    path("get_game_context/<int:game_id>/", get_game_context, name="get_game_context"),
    path("update_game/", update_game, name="update_game"),

    path("notification_subscribe/", notification_subscribe_view, name="notification_subscribe_view")
]
