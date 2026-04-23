from datetime import datetime
from mongoengine import Document, StringField, FloatField, IntField, DateTimeField, ReferenceField
from products.db.product_document import ProductDocument

class OrderDocument(Document):
    meta = {"collection": "orders", "strict": False, "db_alias": "mongodb"}

    product_id = ReferenceField(ProductDocument, required=True)
    username = StringField(required=True) # Linked by username for convenience with auth
    quantity = IntField(required=True, min_value=1)
    address = StringField(required=True)
    payment_details = StringField(required=True)
    status = StringField(default="PENDING", choices=["PENDING", "APPROVED", "REJECTED"])

    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
