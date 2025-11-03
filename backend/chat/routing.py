from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # capture request using regex
    re_path(r"ws/chat/(?P<room_name>\w+)/$", consumers.ChatConsumer.as_asgi()),
]