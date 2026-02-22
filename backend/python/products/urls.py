from django.urls import path
from .views import ProductListCreate, ProductDetail

urlpatterns = [
    path("products/", ProductListCreate.as_view()),
    path("products/<str:product_id>/", ProductDetail.as_view()),
]