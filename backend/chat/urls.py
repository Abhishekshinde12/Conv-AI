from django.urls import path
from .views import GetConversationIdAPIView, GetConnectedUsers

urlpatterns = [
    # used by customer - to get the representative to connect to
    path('get_conversation_id/<uuid:customer_id>/', GetConversationIdAPIView.as_view()),
    # used by representative - to get the customer with whom the representative has conversation id
    path('get_connected_users/<uuid:representative_id>/', GetConnectedUsers.as_view()),
]