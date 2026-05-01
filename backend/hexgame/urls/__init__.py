from django.urls import path, include

urlpatterns = [
    path("", include('hexgame.urls.account')),
    path("game/", include('hexgame.urls.game')),
    path("chat/", include('hexgame.urls.chat')),
    path("api/", include('hexgame.urls.api')),
]
