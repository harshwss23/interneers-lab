from django.urls import path
from accounts.controllers.auth_controller import register, verify_otp, login

urlpatterns = [
    path("auth/register", register),
    path("auth/verify-otp", verify_otp),
    path("auth/login", login),
]