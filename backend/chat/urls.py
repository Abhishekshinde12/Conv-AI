from django.urls import path
from .views import GetConversationIdAPIView

urlpatterns = [
    path('get_conversation_id/<uuid:customer_id>', GetConversationIdAPIView.as_view()),
]