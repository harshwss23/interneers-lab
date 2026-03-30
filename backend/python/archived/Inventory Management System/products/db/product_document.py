from datetime import datetime
from mongoengine import Document, StringField, FloatField, IntField, DateTimeField

class ProductDocument(Document):
    meta = {
        "collection": "products",
        "indexes": ["category_id", "created_by_user_id"],
    }

    name = StringField(required=True)
    description = StringField(default="")
    brand = StringField(required=True)
    price = FloatField(required=True, min_value=0)
    quantity = IntField(required=True, min_value=0)

    category_id = StringField(required=False, null=True) 
    created_by_user_id = StringField(required=True)       

    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)