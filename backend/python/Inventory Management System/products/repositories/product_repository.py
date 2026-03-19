from datetime import datetime
from products.db.product_document import ProductDocument

class ProductRepository:
    def create(self, data: dict) -> ProductDocument:
        doc = ProductDocument(**data)
        doc.created_at = datetime.utcnow()
        doc.updated_at = datetime.utcnow()
        doc.save()
        return doc