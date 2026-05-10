from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json

from .models import Course
from .api.serializers import CourseSerializer


def broadcast_course_update(event_type, course_data):
	"""Broadcast course updates to all connected clients via WebSocket"""
	channel_layer = get_channel_layer()
	async_to_sync(channel_layer.group_send)(
		"courses_updates",
		{
			"type": "course_update",
			"event": event_type,
			"course": course_data,
		},
	)


@receiver(post_save, sender=Course)
def course_created_or_updated(sender, instance, created, **kwargs):
	"""Signal handler for course creation or update"""
	serializer = CourseSerializer(instance)
	event_type = "course_created" if created else "course_updated"
	broadcast_course_update(event_type, serializer.data)


@receiver(post_delete, sender=Course)
def course_deleted(sender, instance, **kwargs):
	"""Signal handler for course deletion"""
	serializer = CourseSerializer(instance)
	broadcast_course_update("course_deleted", serializer.data)
