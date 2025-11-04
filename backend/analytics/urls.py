from django.urls import path
from .views import GetAnalytics

urlpatterns = [
    path('', GetAnalytics.as_view())
]