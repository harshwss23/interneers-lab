from django.apps import AppConfig;


class ProductsConfig(AppConfig):
    name = 'products'

    def ready(self):
        import os
        # Only run in main process (not reloader)
        if os.environ.get('RUN_MAIN') == 'true':
            try:
                from products.repositories.category_repository import ProductCategoryRepository
                from products.services.category_service import ProductCategoryService
                from products.repositories.product_repository import ProductRepository
                from products.services.product_service import ProductService
                
                cat_service = ProductCategoryService(ProductCategoryRepository())
                cat_count = cat_service.seed_categories()
                
                prod_service = ProductService(ProductRepository())
                prod_count = prod_service.seed_products()
                
                print(f"Seeded {cat_count} categories and {prod_count} products on startup.")
            except Exception as e:
                print(f"Error seeding data: {e}")
