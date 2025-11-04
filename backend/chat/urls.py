from django.urls import path
from .views import GetConversationIdAPIView, GetConnectedUsers

urlpatterns = [
    path('get_conversation_id/<uuid:customer_id>/', 
    GetConversationIdAPIView.as_view()),
    path('get_connected_users/<uuid:representative_id>/', GetConnectedUsers.as_view()),
]