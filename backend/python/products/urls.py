from django.urls import path
from products.controllers.product_controller import products_collection, product_item, bulk_upload_products
from products.controllers.category_controller import categories_collection, category_item

urlpatterns = [
    path("products/", products_collection),
    path("products/bulk-upload/", bulk_upload_products),
    path("products/ensure-categories/", products_collection),
    path("products/<str:product_id>/", product_item),
    path("categories/", categories_collection),
    path("categories/<str:category_id>/", category_item),
    path("categories/<str:category_id>/products/", category_item),
    path("categories/<str:category_id>/products/<str:product_id>/", category_item),
]