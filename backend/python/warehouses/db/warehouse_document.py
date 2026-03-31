from datetime import datetime
from mongoengine import Document, StringField, IntField, DateTimeField, ReferenceField
from products.db.product_document import ProductDocument

class WarehouseDocument(Document):
    meta = {"collection": "warehouses", "db_alias": "mongodb"}

    name = StringField(required=True)
    location = StringField(required=True)
    manager_id = StringField(required=True) # ID from the SQL User model
    capacity = IntField(required=True, min_value=0)

    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

class InventoryStockDocument(Document):
    meta = {"collection": "inventory_stock", "db_alias": "mongodb"}

    product_id = ReferenceField(ProductDocument, required=True)
    warehouse_id = ReferenceField(WarehouseDocument, required=True)
    quantity = IntField(required=True, min_value=0)
    reorder_threshold = IntField(default=10)

class StockMovementDocument(Document):
    meta = {"collection": "stock_movements", "db_alias": "mongodb"}

    product_id = ReferenceField(ProductDocument, required=True)
    warehouse_id = ReferenceField(WarehouseDocument, required=True)
    quantity = IntField(required=True) # Positive for IN, Negative for OUT
    movement_type = StringField(choices=('IN', 'OUT'), required=True)
    timestamp = DateTimeField(default=datetime.utcnow)
    remarks = StringField()
