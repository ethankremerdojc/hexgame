from django.contrib.auth import views as auth_views
from django.urls import path

from .views import *

urlpatterns = [
    path("", home_view, name="home"),
    path("register/", register_view, name="register"),
    path("login/", auth_views.LoginView.as_view(
        template_name="hexgame/account/login.html",
        redirect_authenticated_user=True,
    ), name="login"),
    path("logout/", auth_views.LogoutView.as_view(), name="logout"),

    # Game
    path("game/<int:game_id>/", game_view, name="game"),
    path("game/iframe/", game_iframe, name="game_iframe"),
    path("game/get_context/<int:game_id>/", get_game_context, name="get_game_context"),
    path("game/update/", update_game, name="update_game"),
    path("game/create/", create_game_view, name="create_game"),
]
