from typing import List, Optional
from warehouses.repositories.warehouse_repository import WarehouseRepository, InventoryRepository
from warehouses.db.warehouse_document import WarehouseDocument, InventoryStockDocument

class WarehouseService:
    def __init__(self, repo: WarehouseRepository, inventory_repo: InventoryRepository):
        self.repo = repo
        self.inventory_repo = inventory_repo

    def create_warehouse(self, data: dict) -> WarehouseDocument:
        return self.repo.create(data)

    def list_warehouses(self) -> List[WarehouseDocument]:
        return self.repo.list_all()

    def get_warehouse(self, warehouse_id: str) -> Optional[WarehouseDocument]:
        return self.repo.get_by_id(warehouse_id)

    def update_warehouse(self, warehouse_id: str, patch: dict) -> Optional[WarehouseDocument]:
        return self.repo.update(warehouse_id, patch)

    def delete_warehouse(self, warehouse_id: str) -> bool:
        return self.repo.delete(warehouse_id)

    def get_warehouse_stock(self, warehouse_id: str) -> List[InventoryStockDocument]:
        return self.inventory_repo.list_warehouse_inventory(warehouse_id)

    def adjust_stock(self, warehouse_id: str, product_id: str, quantity: int, movement_type: str, remarks: str = "") -> InventoryStockDocument:
        return self.inventory_repo.update_stock(warehouse_id, product_id, quantity, movement_type, remarks)
