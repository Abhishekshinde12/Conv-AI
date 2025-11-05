from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # capture request using regex
    # here it captures the room id (which is the conversation_id)between an customer and representative
    re_path(r"ws/chat/(?P<room_name>[\w-]+)/$", consumers.ChatConsumer.as_asgi()),
]