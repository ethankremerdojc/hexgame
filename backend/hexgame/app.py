from django.apps import AppConfig

class HexgameConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "hexgame"

    def ready(self):
        from django.contrib.auth.models import User
        from .models import PushSubscription

        @property
        def has_subscribed(self):
            return PushSubscription.objects.filter(user=self).exists()

        User.add_to_class("has_subscribed", has_subscribed)
