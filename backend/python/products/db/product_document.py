from datetime import datetime
from mongoengine import Document, StringField, FloatField, IntField, DateTimeField

class ProductDocument(Document):
    meta = {"collection": "products"}

    name = StringField(required=True)
    description = StringField(default="")
    brand = StringField(required=True)
    price = FloatField(required=True, min_value=0)
    quantity = IntField(required=True, min_value=0)

    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)