from channels.generic.websocket import AsyncWebsocketConsumer
import json
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

User = get_user_model()


class CourseUpdateConsumer(AsyncWebsocketConsumer):
	"""WebSocket consumer for real-time course updates"""

	async def connect(self):
		"""Handle WebSocket connection"""
		# Get token from URL query parameters
		query_string = self.scope.get("query_string", b"").decode()
		try:
			token = None
			for param in query_string.split("&"):
				if param.startswith("token="):
					token = param.split("=", 1)[1]
					break

			if token:
				# Verify token
				access_token = AccessToken(token)
				self.user_id = access_token["user_id"]
				self.user = await database_sync_to_async(User.objects.get)(id=self.user_id)
			else:
				await self.close()
				return

		except Exception as e:
			await self.close()
			return

		# Add to group
		await self.channel_layer.group_add("courses_updates", self.channel_name)
		await self.accept()

	async def disconnect(self, close_code):
		"""Handle WebSocket disconnection"""
		await self.channel_layer.group_discard("courses_updates", self.channel_name)

	async def course_update(self, event):
		"""Receive course update from group and send to WebSocket"""
		message = {
			"type": "course_update",
			"event": event["event"],
			"course": event["course"],
		}
		await self.send(text_data=json.dumps(message))
