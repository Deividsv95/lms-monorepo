from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .api.serializers import CourseSerializer
from .models import Course


def broadcast_course_update(event_type, course_data):
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return

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
    serializer = CourseSerializer(instance)
    event_type = "course_created" if created else "course_updated"
    broadcast_course_update(event_type, serializer.data)


@receiver(post_delete, sender=Course)
def course_deleted(sender, instance, **kwargs):
    serializer = CourseSerializer(instance)
    broadcast_course_update("course_deleted", serializer.data)
