from django.core.management.base import BaseCommand
from products.db.product_document import ProductDocument
from products.db.category_document import ProductCategoryDocument

class Command(BaseCommand):
    help = "Migrate existing products to include brand and category"

    def handle(self, *args, **options):
        # 1. Ensure a "General" category exists
        general_cat = ProductCategoryDocument.objects(title="General").first()
        if not general_cat:
            general_cat = ProductCategoryDocument(title="General", description="General items").save()
            self.stdout.write(self.style.SUCCESS("Created 'General' category for migration."))

        # 2. Update products
        count = 0
        from mongoengine.errors import DoesNotExist
        for product in ProductDocument.objects:
            updated = False
            
            # Brand validation
            if not product.brand:
                product.brand = "Unknown"
                updated = True
            
            # Category assignment (handle invalid references)
            try:
                if not product.category_id:
                    product.category_id = general_cat
                    updated = True
            except DoesNotExist:
                self.stdout.write(self.style.WARNING(f"Product '{product.name}' has invalid category reference. Resetting to General."))
                product.category_id = general_cat
                updated = True
                
            if updated:
                product.save()
                count += 1
        
        self.stdout.write(self.style.SUCCESS(f"Migration complete. Updated {count} products."))
