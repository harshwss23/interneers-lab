from django.urls import path
from .views import greet_view

urlpatterns = [
    path("greet/", greet_view, name="greet"),
]
