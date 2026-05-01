import json
from hexgame.models import PushSubscription
from pywebpush import webpush, WebPushException
from backend import settings
from django.http import JsonResponse

def send_push_notif(user, title, body, game_id):
    payload = json.dumps({
        "title": title,
        "body": body,
        "url": f"/game/{game_id}/",
    })

    sent = 0
    failed = 0

    for sub in PushSubscription.objects.filter(user=user):
        subscription_info = {
            "endpoint": sub.endpoint,
            "keys": {
                "p256dh": sub.p256dh,
                "auth": sub.auth,
            },
        }

        try:
            webpush(
                subscription_info=subscription_info,
                data=payload,
                vapid_private_key=settings.WEBPUSH_VAPID_PRIVATE_KEY,
                vapid_claims={
                    "sub": settings.WEBPUSH_VAPID_ADMIN_EMAIL,
                },
            )
            sent += 1
        except WebPushException:
            failed += 1
