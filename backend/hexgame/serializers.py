from rest_framework import serializers
from .models import *

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username"
        ]

class PlayerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Player
        fields = [
            "id",
            "user",
            "game"
        ]

# class GameEventSerializer(serializers.ModelSerializer):
#     player = PlayerSerializer(read_only=True)
#
#     class Meta:
#         model = GameEvent
#         fields = [
#             "id",
#             "timestamp",
#             "player"
#         ]

class GameSerializer(serializers.ModelSerializer):
    players = PlayerSerializer(many=True, read_only=True)
    created_by = serializers.SerializerMethodField()

    def get_created_by(self, obj):
        return UserSerializer(obj.creator).data

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
            "turn_number",
            "complete",
            "created_by"
        ]

class ChatMessageSerializer(serializers.ModelSerializer):
    player = PlayerSerializer(read_only=True)

    class Meta:
        model = ChatMessage
        fields = [
            "id",
            "timestamp",
            "player",
            "message"
        ]
