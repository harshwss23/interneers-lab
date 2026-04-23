from datetime import datetime
from mongoengine import Document, StringField, IntField, DateTimeField, ReferenceField, ListField, EmbeddedDocument, EmbeddedDocumentField
from products.db.product_document import ProductDocument

class CartItem(EmbeddedDocument):
    product_id = ReferenceField(ProductDocument, required=True)
    quantity = IntField(default=1, min_value=1)

class CartDocument(Document):
    meta = {"collection": "carts", "strict": False, "db_alias": "mongodb"}

    username = StringField(required=True, unique=True)
    items = ListField(EmbeddedDocumentField(CartItem))
    
    updated_at = DateTimeField(default=datetime.utcnow)
