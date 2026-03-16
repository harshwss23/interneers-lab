from django.core.management.base import BaseCommand
from products.repositories.category_repository import ProductCategoryRepository
from products.schemas.category_schemas import CategoryCreateRequest

class Command(BaseCommand):
    help = "Seed initial product categories"

    def handle(self, *args, **options):
        repo = ProductCategoryRepository()
        categories = [
            {"title": "Food", "description": "Groceries and food items"},
            {"title": "Kitchen Essentials", "description": "Appliances and kitchen tools"},
            {"title": "Electronics", "description": "Gadgets and electronic items"},
            {"title": "Fashion", "description": "Clothing and accessories"},
        ]

        for cat_data in categories:
            try:
                # Basic check if already exists by title
                from products.db.category_document import ProductCategoryDocument
                if ProductCategoryDocument.objects(title=cat_data["title"]).first():
                    self.stdout.write(self.style.WARNING(f"Category '{cat_data['title']}' already exists. Skipping."))
                    continue
                
                repo.create(cat_data)
                self.stdout.write(self.style.SUCCESS(f"Successfully created category '{cat_data['title']}'"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed to create category '{cat_data['title']}': {str(e)}"))
