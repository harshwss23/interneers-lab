from datetime import datetime
from mongoengine import Document, StringField, DateTimeField

class ProductCategoryDocument(Document):
    meta = {"collection": "product_categories", "db_alias": "mongodb"}

    title = StringField(required=True, unique=True)
    description = StringField(default="")

    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
