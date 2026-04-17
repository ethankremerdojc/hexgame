from rest_framework import serializers
from .models import Game, Player
from django.contrib.auth.models import User

class PlayerSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()  # or use UserSerializer if needed

    class Meta:
        model = Player
        fields = ["id", "user", "game"]


class GameSerializer(serializers.ModelSerializer):
    players = PlayerSerializer(many=True, read_only=True)

    class Meta:
        model = Game
        fields = [
            "id",
            "current_player_turn",
            "board_state",
            "minutes_per_turn",
            "creation_time",
            "kick_if_inactive",
            "players",
        ]
