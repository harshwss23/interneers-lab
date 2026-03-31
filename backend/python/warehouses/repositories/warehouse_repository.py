from datetime import datetime, timezone
from typing import List, Optional
from bson import ObjectId
from mongoengine.errors import DoesNotExist
from warehouses.db.warehouse_document import WarehouseDocument, InventoryStockDocument, StockMovementDocument

class WarehouseRepository:
    def create(self, data: dict) -> WarehouseDocument:
        doc = WarehouseDocument(**data)
        doc.created_at = datetime.now(timezone.utc)
        doc.updated_at = datetime.now(timezone.utc)
        doc.save()
        return doc

    def list_all(self) -> List[WarehouseDocument]:
        return list(WarehouseDocument.objects.order_by("-created_at"))

    def get_by_id(self, warehouse_id: str) -> Optional[WarehouseDocument]:
        try:
            if not ObjectId.is_valid(warehouse_id):
                return None
            return WarehouseDocument.objects.get(id=warehouse_id)
        except DoesNotExist:
            return None

    def update(self, warehouse_id: str, patch: dict) -> Optional[WarehouseDocument]:
        doc = self.get_by_id(warehouse_id)
        if not doc:
            return None
        for k, v in patch.items():
            setattr(doc, k, v)
        doc.updated_at = datetime.now(timezone.utc)
        doc.save()
        return doc

    def delete(self, warehouse_id: str) -> bool:
        doc = self.get_by_id(warehouse_id)
        if not doc:
            return False
        doc.delete()
        return True

class InventoryRepository:
    def get_stock(self, warehouse_id: str, product_id: str) -> Optional[InventoryStockDocument]:
        try:
            return InventoryStockDocument.objects.get(warehouse_id=warehouse_id, product_id=product_id)
        except DoesNotExist:
            return None

    def update_stock(self, warehouse_id: str, product_id: str, quantity_change: int, movement_type: str, remarks: str = "") -> InventoryStockDocument:
        stock = self.get_stock(warehouse_id, product_id)
        if not stock:
            if quantity_change < 0:
                raise ValueError("Cannot decrease stock for non-existent inventory")
            stock = InventoryStockDocument(
                warehouse_id=ObjectId(warehouse_id),
                product_id=ObjectId(product_id),
                quantity=0
            )
        
        stock.quantity += quantity_change
        if stock.quantity < 0:
            raise ValueError("Insufficient stock")
        
        stock.save()

        # Record movement
        movement = StockMovementDocument(
            warehouse_id=ObjectId(warehouse_id),
            product_id=ObjectId(product_id),
            quantity=quantity_change,
            movement_type=movement_type,
            remarks=remarks
        )
        movement.save()
        
        return stock

    def list_warehouse_inventory(self, warehouse_id: str) -> List[InventoryStockDocument]:
        return list(InventoryStockDocument.objects(warehouse_id=warehouse_id))
