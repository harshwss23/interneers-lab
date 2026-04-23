from django.urls import path
from .views import RegisterView, LoginView, UserListView, UserUpdateView, SendOTPView, VerifyOTPView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:user_id>/', UserUpdateView.as_view(), name='user-update'),
]
