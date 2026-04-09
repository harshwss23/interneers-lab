from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
import csv
from collections import Counter
from datetime import datetime
from .db.order_document import OrderDocument
from products.models import Product
from products.db.product_document import ProductDocument
from products.db.category_document import ProductCategoryDocument
from warehouses.db.warehouse_document import WarehouseDocument, InventoryStockDocument

class ReportingView(APIView):
    def get(self, request):
        user = request.user
        report_type = request.query_params.get('type')
        warehouse_id = request.query_params.get('warehouse_id')
        
        if user.role == 'ADMIN':
            if warehouse_id:
                try:
                    warehouse = WarehouseDocument.objects.get(id=warehouse_id)
                    queryset = Product.objects.filter(created_by__username=warehouse.manager_id)
                except:
                    queryset = Product.objects.none()
            else:
                queryset = Product.objects.all()
        else:
            queryset = Product.objects.filter(created_by=user)
        
        my_products = list(queryset)

        if report_type == 'categories':
            return self.get_categories_report(my_products, request)
        elif report_type == 'price-segments':
            return self.get_price_segments_report(my_products)
        elif report_type == 'at-risk':
            return self.get_at_risk_report(my_products)
        
        return Response({"detail": "Invalid report type"}, status=status.HTTP_400_BAD_REQUEST)

    def get_categories_report(self, products, request):
        min_count = int(request.query_params.get('min_count', 0))
        max_count = int(request.query_params.get('max_count', 999999))
        
        cat_counts = Counter([p.category.title() if p.category else "Unknown" for p in products])
        
        report = []
        for cat_name, count in cat_counts.items():
            if min_count <= count <= max_count:
                report.append({
                    "category": cat_name,
                    "product_count": count
                })
        return Response(report)

    def get_price_segments_report(self, products):
        segments = {
            "Budget ($0-50)": 0,
            "Mid-Range ($51-200)": 0,
            "Premium ($201-1000)": 0,
            "Luxury ($1000+)": 0
        }
        for p in products:
            price = float(p.price or 0)
            if price <= 50: segments["Budget ($0-50)"] += 1
            elif price <= 200: segments["Mid-Range ($51-200)"] += 1
            elif price <= 1000: segments["Premium ($201-1000)"] += 1
            else: segments["Luxury ($1000+)"] += 1
        
        report = [{"segment": k, "count": v} for k, v in segments.items()]
        return Response(report)

    def get_at_risk_report(self, products):
        threshold = 10
        # Products running low
        low_stock_products = [p for p in products if (p.quantity or 0) < threshold]
        
        cat_map = {} # cat_name -> [total, low]
        
        for p in products:
            cat_name = p.category.title() if p.category else "Unknown"
            if cat_name not in cat_map: cat_map[cat_name] = [0, 0]
            cat_map[cat_name][0] += 1
            if (p.quantity or 0) < threshold:
                cat_map[cat_name][1] += 1
        
        at_risk_categories = []
        for cat_name, stats in cat_map.items():
            total, low = stats
            if total > 0 and (low / total) > 0.1:
                at_risk_categories.append({
                    "category": cat_name,
                    "low_percent": round((low / total * 100), 1) if total > 0 else 0,
                    "low_count": low,
                    "total_count": total
                })
        
        return Response({
            "low_stock_products": [{"id": p.id, "name": p.name, "quantity": p.quantity} for p in low_stock_products[:15]],
            "at_risk_categories": at_risk_categories
        })

class WarehouseSummaryView(APIView):
    def get(self, request):
        if request.user.role != 'ADMIN':
            return Response({"detail": "Admin only"}, status=status.HTTP_403_FORBIDDEN)
        
        # Get all managers who have posted products in SQL
        manager_usernames = list(Product.objects.values_list('created_by__username', flat=True).distinct())
        
        # Get explicit warehouses
        warehouses = WarehouseDocument.objects.all()
        warehouse_map = {w.manager_id: w for w in warehouses}
        
        summary = []
        processed_managers = set()

        def process_manager(username, w_obj=None):
            if not username: return
            processed_managers.add(username)
            
            # Aggregate from SQL products created by the warehouse manager
            manager_products = Product.objects.filter(created_by__username=username)
            total_value = sum((p.price or 0) * (p.quantity or 0) for p in manager_products)
            total_items = sum((p.quantity or 0) for p in manager_products)
            
            # Product level breakdown
            product_breakdown = [{
                "name": p.name,
                "price": float(p.price or 0),
                "quantity": p.quantity,
                "value": round(float((p.price or 0) * (p.quantity or 0)), 2)
            } for p in manager_products]
            
            summary.append({
                "id": str(w_obj.id) if w_obj else f"virtual_{username}",
                "name": w_obj.name if w_obj else f"Manager: {username}",
                "location": w_obj.location if w_obj else "Global / Remote",
                "manager_username": username,
                "total_value": round(float(total_value), 2),
                "total_items": total_items,
                "products": product_breakdown
            })

        # 1. Process explicit warehouses
        for m_id, w in warehouse_map.items():
            process_manager(m_id, w)

        # 2. Process managers without explicit warehouses
        for m_id in manager_usernames:
            if m_id and m_id not in processed_managers:
                process_manager(m_id)
            
        return Response(summary)

class CSVExportView(APIView):
    def get(self, request):
        user = request.user
        report_type = request.query_params.get('type')
        warehouse_id = request.query_params.get('warehouse_id')
        
        if user.role == 'ADMIN':
            if warehouse_id:
                try:
                    warehouse = WarehouseDocument.objects.get(id=warehouse_id)
                    queryset = Product.objects.filter(created_by__username=warehouse.manager_id)
                except:
                    queryset = Product.objects.none()
            else:
                queryset = Product.objects.all()
        else:
            queryset = Product.objects.filter(created_by=user)

        products = list(queryset)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="warehouse_report_{report_type}_{datetime.now().strftime("%Y%m%d")}.csv"'
        
        writer = csv.writer(response)
        
        if report_type == 'inventory':
            writer.writerow(['Product Name', 'Category', 'Price', 'Quantity', 'Warehouse/Manager'])
            for p in products:
                creator_name = p.created_by.username if p.created_by else "Global"
                writer.writerow([p.name, p.category, p.price, p.quantity, creator_name])
        
        elif report_type == 'low_stock':
            writer.writerow(['Product Name', 'Current Quantity', 'Warehouse/Manager'])
            for p in products:
                if (p.quantity or 0) < 10:
                    creator_name = p.created_by.username if p.created_by else "Global"
                    writer.writerow([p.name, p.quantity, creator_name])
        
        return response
