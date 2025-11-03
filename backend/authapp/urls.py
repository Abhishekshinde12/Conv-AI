from django.urls import path
from .views import MyTokenObtainPairView, MyUserRegistrationView, MyTokenRefreshView, LogoutView, tempFunc
urlpatterns = [
    path('user_register/', MyUserRegistrationView.as_view(), name='register'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', MyTokenRefreshView.as_view(), name='token_refresh'),
    path('temp/', tempFunc)
]