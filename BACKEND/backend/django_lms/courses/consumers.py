import json

from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.tokens import AccessToken


class CourseUpdateConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time course updates."""

    async def connect(self):
        query_string = self.scope.get("query_string", b"").decode()
        token = None

        for param in query_string.split("&"):
            if param.startswith("token="):
                token = param.split("=", 1)[1]
                break

        if not token:
            await self.close()
            return

        try:
            AccessToken(token)
        except Exception:
            await self.close()
            return

        await self.channel_layer.group_add("courses_updates", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("courses_updates", self.channel_name)

    async def course_update(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "course_update",
                    "event": event["event"],
                    "course": event["course"],
                }
            )
        )
