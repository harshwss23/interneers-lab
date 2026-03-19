from django.urls import path
from products.controllers.product_controller import create_product

urlpatterns = [
    path("products", create_product),
]