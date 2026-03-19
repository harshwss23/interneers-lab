from django.core.management.base import BaseCommand
from products.repositories.product_repository import ProductRepository
from products.services.product_service import ProductService

class Command(BaseCommand):
    help = "Migrate existing products without categories to the General category"

    def handle(self, *args, **options):
        self.stdout.write("Starting product category migration...")
        
        service = ProductService(ProductRepository())
        count = service.ensure_all_products_have_category()
        
        if count == 0:
            self.stdout.write("No products needed migration.")
        else:
            self.stdout.write(self.style.SUCCESS(f"Successfully migrated {count} products."))
