from datetime import datetime
from mongoengine import Document, StringField, FloatField, IntField, DateTimeField, ReferenceField
from products.db.category_document import ProductCategoryDocument

class ProductDocument(Document):
    meta = {"collection": "products", "strict": False, "db_alias": "mongodb"}

    name = StringField(required=True)
    description = StringField(default="")
    brand = StringField(required=True)
    category_id = ReferenceField(ProductCategoryDocument, required=False)
    price = FloatField(required=True, min_value=0)
    quantity = IntField(required=True, min_value=0)
    created_by = StringField(required=False)

    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)