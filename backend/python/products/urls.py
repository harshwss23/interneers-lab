# from django.urls import path
# from .views import ProductListCreate, ProductDetail

# urlpatterns = [
#     path("products/", ProductListCreate.as_view()),
#     path("products/<str:product_id>/", ProductDetail.as_view()),
# ]

from django.urls import path
from products.controllers.product_controller import products_collection, product_item

urlpatterns = [
    path("products", products_collection),
    path("products/<str:product_id>", product_item),
]