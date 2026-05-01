from django.contrib.auth import views as auth_views
from django.urls import path, include
from hexgame.views.account import *

urlpatterns = [
    path("", home_view, name="home"),
    path("archive/", archive_view, name="archive"),
    path("register/", register_view, name="register"),
    path("login/", auth_views.LoginView.as_view(
        template_name="hexgame/account/login.html",
        redirect_authenticated_user=True,
    ), name="login"),
    path("logout/", auth_views.LogoutView.as_view(), name="logout")
]
