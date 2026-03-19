from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from mongoengine.errors import DoesNotExist
from products.db.category_document import ProductCategoryDocument

class ProductCategoryRepository:
    def create(self, data: dict) -> ProductCategoryDocument:
        doc = ProductCategoryDocument(**data)
        doc.created_at = datetime.utcnow()
        doc.updated_at = datetime.utcnow()
        doc.save()
        return doc

    def list_all(self) -> List[ProductCategoryDocument]:
        return list(ProductCategoryDocument.objects.order_by("-created_at"))

    def get_by_id(self, category_id: str) -> Optional[ProductCategoryDocument]:
        try:
            if not ObjectId.is_valid(category_id):
                return None
            return ProductCategoryDocument.objects.get(id=category_id)
        except DoesNotExist:
            return None

    def get_by_title(self, title: str) -> Optional[ProductCategoryDocument]:
        return ProductCategoryDocument.objects(title=title).first()

    def update(self, category_id: str, patch: dict) -> Optional[ProductCategoryDocument]:
        doc = self.get_by_id(category_id)
        if not doc:
            return None

        for k, v in patch.items():
            setattr(doc, k, v)

        doc.updated_at = datetime.utcnow()
        doc.save()
        return doc

    def delete(self, category_id: str) -> bool:
        doc = self.get_by_id(category_id)
        if not doc:
            return False
        doc.delete()
        return True
