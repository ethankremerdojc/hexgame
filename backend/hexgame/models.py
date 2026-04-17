from django.contrib.auth.models import User
from django.db import models

class Game(models.Model):
    # and have methods to retreive these via api.
    # Should have a time per turn, and timestamps for 
    # creation etc.

    current_player_turn = models.IntegerField()
    board_state = models.JSONField()
    minutes_per_turn = models.IntegerField()
    creation_time = models.DateTimeField(auto_now_add=True)
    kick_if_inactive = models.BooleanField()

    @property
    def players(self):
        return Player.objects.filter(game=self)

class Player(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    game = models.ForeignKey('Game', on_delete=models.CASCADE)

class GameEvent(models.Model):
    player = models.ForeignKey('Player', on_delete=models.CASCADE)
    timestsamp = models.DateTimeField(auto_now_add=True)
