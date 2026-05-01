from django.contrib.auth import views as auth_views
from django.urls import path, include
from hexgame.views.chat import *

urlpatterns = [
    path("post_message/", post_chat_message, name="post_chat_message"),
    path("get_messages/<int:game_id>/", get_chat_messages, name="get_chat_messages"),
]
