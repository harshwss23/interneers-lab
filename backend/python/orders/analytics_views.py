from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .db.order_document import OrderDocument
from products.models import Product
from products.db.product_document import ProductDocument
from products.db.category_document import ProductCategoryDocument
from warehouses.db.warehouse_document import WarehouseDocument, InventoryStockDocument
from collections import Counter
from datetime import datetime, timedelta

class AnalyticsOverviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        warehouse_id = request.query_params.get('warehouse_id')
        
        if user.role not in ['ADMIN', 'WAREHOUSE_MANAGER']:
            return Response({"detail": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

        # 1. Base query for SQL products
        if user.role == 'ADMIN':
            if warehouse_id:
                if warehouse_id.startswith('virtual_'):
                    manager_username = warehouse_id.replace('virtual_', '')
                    queryset = Product.objects.filter(created_by__username=manager_username)
                else:
                    try:
                        warehouse = WarehouseDocument.objects.get(id=warehouse_id)
                        manager_username = warehouse.manager_id
                        queryset = Product.objects.filter(created_by__username=manager_username)
                    except:
                        queryset = Product.objects.none()
            else:
                queryset = Product.objects.all()
        else:
            queryset = Product.objects.filter(created_by=user)
        
        # Use Product SQL model for everything else
        my_products = list(queryset)
        my_product_ids = [p.id for p in my_products]

        # Inventory Value by Category (Only for products in stock)
        category_stats = {}
        for p in my_products:
            if (p.quantity or 0) <= 0:
                continue
            cat_name = p.category.title() if p.category else "Unknown"
            value = (p.price or 0) * (p.quantity or 0)
            
            if cat_name not in category_stats:
                category_stats[cat_name] = {"value": 0, "count": 0}
            category_stats[cat_name]["value"] += float(value)
            category_stats[cat_name]["count"] += 1

        inventory_value_data = [{"name": k, "value": round(v["value"], 2), "count": v["count"]} for k, v in category_stats.items()]

        # Order Status Breakdown (Orders are in Mongo)
        # We need to map SQL products to their corresponding Mongo documents to get valid ObjectIds
        from bson import ObjectId
        
        # Optimization: Map by name if products were migrated
        product_names = [p.name for p in my_products]
        mongo_products = ProductDocument.objects(name__in=product_names).only('id', 'name')
        mongo_id_map = {mp.name: mp.id for mp in mongo_products}
        
        # Collect all valid ObjectIds for products owned by this user
        valid_mongo_ids = [mongo_id_map[p.name] for p in my_products if p.name in mongo_id_map]
        
        order_statuses = OrderDocument.objects(product_id__in=valid_mongo_ids).only('status')
        status_counts = Counter([o.status for o in order_statuses])
        order_status_data = [{"name": k, "value": v} for k, v in status_counts.items()]

        # Stock Alerts
        low_stock_threshold = 10
        low_stock_products = [p for p in my_products if (p.quantity or 0) < low_stock_threshold]
        low_stock_data = [{"name": p.name, "value": p.quantity} for p in low_stock_products[:10]]

        # Sales Velocity
        today = datetime.utcnow()
        last_7_days = [(today - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(6, -1, -1)]
        velocity_data = {day: 0 for day in last_7_days}
        
        recent_orders = OrderDocument.objects(
            product_id__in=valid_mongo_ids,
            created_at__gte=today - timedelta(days=7)
        )
        for o in recent_orders:
            day_str = o.created_at.strftime('%Y-%m-%d')
            if day_str in velocity_data:
                velocity_data[day_str] += 1
        
        sales_velocity_data = [{"name": k, "value": v} for k, v in velocity_data.items()]

        # Admin Specific: Warehouse Breakdown
        warehouse_value_data = []
        orders_per_warehouse = []
        if user.role == 'ADMIN' and not warehouse_id:
            # 1. Get all managers who have posted products in SQL
            manager_usernames = list(Product.objects.values_list('created_by__username', flat=True).distinct())
            
            # 2. Get explicit warehouses
            warehouses = WarehouseDocument.objects.all()
            warehouse_map = {w.manager_id: w for w in warehouses}
            
            processed_managers = set()

            def process_manager_stats(username, w_obj=None):
                if not username: return
                processed_managers.add(username)
                
                w_name = w_obj.name if w_obj else f"Manager: {username}"
                
                # Value and Count from SQL (Only for products in stock)
                manager_products = Product.objects.filter(created_by__username=username, quantity__gt=0)
                w_value = sum((p.price or 0) * (p.quantity or 0) for p in manager_products)
                warehouse_value_data.append({"name": w_name, "value": round(float(w_value), 2)})
                
                # Orders from Mongo
                w_product_names = [p.name for p in manager_products]
                w_mongo_products = ProductDocument.objects(name__in=w_product_names).only('id')
                w_valid_mongo_ids = [mp.id for mp in w_mongo_products]
                
                w_orders_count = OrderDocument.objects(product_id__in=w_valid_mongo_ids).count()
                orders_per_warehouse.append({"name": w_name, "value": w_orders_count})

            # Process explicit warehouses
            for m_id, w in warehouse_map.items():
                process_manager_stats(m_id, w)

            # Process managers without explicit warehouses
            for m_id in manager_usernames:
                if m_id and m_id not in processed_managers:
                    process_manager_stats(m_id)

        return Response({
            "inventory_value": inventory_value_data,
            "order_status": order_status_data,
            "low_stock": low_stock_data,
            "sales_velocity": sales_velocity_data,
            "warehouse_value": warehouse_value_data,
            "orders_per_warehouse": orders_per_warehouse
        })
