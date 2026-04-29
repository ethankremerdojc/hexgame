import math
from django.contrib.auth.models import User
from django.db import models
# from datetime import datetime
from django.utils import timezone

class GameManager(models.Manager):
    def archived(self):
        return self.filter(archived=True)

    def non_archived(self):
        return self.filter(archived=False)

class Game(models.Model): 
    objects = GameManager()

    turn_number = models.IntegerField()
    current_player_turn = models.IntegerField()
    board_state = models.JSONField()
    minutes_per_turn = models.IntegerField()
    creation_time = models.DateTimeField(auto_now_add=True)
    kick_if_inactive = models.BooleanField()

    complete = models.BooleanField(default=False)
    archived = models.BooleanField(default=False)
    winner = models.ForeignKey(User, on_delete=models.CASCADE, null=True)

    @property
    def players(self):
        return Player.objects.filter(game=self)

    @property
    def current_player_turn_user(self):
        return self.players[self.current_player_turn].user

    @property
    def time_since_last_update(self):
        events = PlayerEvent.objects.filter(player__in=self.players)

        now = timezone.now()

        if events.count() == 0:
            dif = now - self.creation_time
        else:
            dif = now - events.latest('timestamp').timestamp

        one_hour_in_seconds = 3600

        days = dif.days

        hours = math.floor(dif.seconds / one_hour_in_seconds)
        leftover_secs_after_hours = dif.seconds - (hours*one_hour_in_seconds)
        minutes = math.floor(leftover_secs_after_hours / 60)
        seconds = dif.seconds - (minutes*60)

        if days > 1:
            return f"{days} days, {hours} hours"
        if days == 1:
            return f"1 day, {hours} hours"
        if hours > 1:
            return f"{hours} hours, {minutes} minutes"

        if dif.seconds == 1:
            return "1 second"

        if dif.seconds < 60:
            return f"{seconds} seconds"

        if minutes == 1:
            return f"1 minute, {seconds} seconds"

        return f"{math.floor(dif.seconds / 60)} minutes"

class Player(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    game = models.ForeignKey('Game', on_delete=models.CASCADE)

class PlayerEvent(models.Model):
    player = models.ForeignKey('Player', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

class PushSubscription(models.Model):
    endpoint = models.TextField(unique=True)
    p256dh = models.TextField()
    auth = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
