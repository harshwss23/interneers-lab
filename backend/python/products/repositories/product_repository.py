from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from mongoengine.errors import DoesNotExist
from products.db.product_document import ProductDocument

class ProductRepository:
    def create(self, data: dict) -> ProductDocument:
        doc = ProductDocument(**data)
        doc.created_at = datetime.utcnow()
        doc.updated_at = datetime.utcnow()
        doc.save()
        return doc

    def list_all(self) -> List[ProductDocument]:
        return list(ProductDocument.objects.order_by("-created_at"))

    def get_by_id(self, product_id: str) -> Optional[ProductDocument]:
        try:
            if not ObjectId.is_valid(product_id):
                return None
            return ProductDocument.objects.get(id=product_id)
        except DoesNotExist:
            return None

    def update(self, product_id: str, patch: dict) -> Optional[ProductDocument]:
        doc = self.get_by_id(product_id)
        if not doc:
            return None

        for k, v in patch.items():
            setattr(doc, k, v)

        doc.updated_at = datetime.utcnow()
        doc.save()
        return doc

    def delete(self, product_id: str) -> bool:
        doc = self.get_by_id(product_id)
        if not doc:
            return False
        doc.delete()
        return True