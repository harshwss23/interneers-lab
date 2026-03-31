from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdmin, IsWarehouseManager, IsAdminOrWarehouseManager
from warehouses.repositories.warehouse_repository import WarehouseRepository, InventoryRepository
from warehouses.services.warehouse_service import WarehouseService

warehouse_service = WarehouseService(WarehouseRepository(), InventoryRepository())

class WarehouseListView(APIView):
    permission_classes = [IsAdminOrWarehouseManager]

    def get(self, request):
        warehouses = warehouse_service.list_warehouses()
        return Response({
            "data": [{
                "id": str(w.id),
                "name": w.name,
                "location": w.location,
                "manager_id": w.manager_id,
                "capacity": w.capacity
            } for w in warehouses]
        })

    def post(self, request):
        # Only Admin can create warehouses
        if request.user.role != 'ADMIN':
            return Response({"error": "Only admins can create warehouses"}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data
        warehouse = warehouse_service.create_warehouse(data)
        return Response({
            "data": {
                "id": str(warehouse.id),
                "name": warehouse.name,
                "location": warehouse.location,
                "manager_id": warehouse.manager_id,
                "capacity": warehouse.capacity
            }
        }, status=status.HTTP_201_CREATED)

class WarehouseDetailView(APIView):
    permission_classes = [IsAdminOrWarehouseManager]

    def get(self, request, warehouse_id):
        w = warehouse_service.get_warehouse(warehouse_id)
        if not w:
            return Response({"error": "Warehouse not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response({
            "data": {
                "id": str(w.id),
                "name": w.name,
                "location": w.location,
                "manager_id": w.manager_id,
                "capacity": w.capacity
            }
        })

class WarehouseStockView(APIView):
    permission_classes = [IsAdminOrWarehouseManager]

    def get(self, request, warehouse_id):
        stocks = warehouse_service.get_warehouse_stock(warehouse_id)
        return Response({
            "data": [{
                "product_id": str(s.product_id.id),
                "warehouse_id": str(s.warehouse_id.id),
                "quantity": s.quantity,
                "reorder_threshold": s.reorder_threshold
            } for s in stocks]
        })

class StockAdjustmentView(APIView):
    permission_classes = [IsAdminOrWarehouseManager]

    def post(self, request, warehouse_id):
        data = request.data
        product_id = data.get('product_id')
        quantity = data.get('quantity')
        movement_type = data.get('movement_type')
        remarks = data.get('remarks', "")

        if not all([product_id, quantity, movement_type]):
            return Response({"error": "Missing fields"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            stock = warehouse_service.adjust_stock(
                warehouse_id, product_id, int(quantity), movement_type, remarks
            )
            return Response({
                "data": {
                    "product_id": str(stock.product_id.id),
                    "warehouse_id": str(stock.warehouse_id.id),
                    "quantity": stock.quantity
                }
            })
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
