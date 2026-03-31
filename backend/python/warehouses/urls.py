from django.urls import path
from .views import WarehouseListView, WarehouseDetailView, WarehouseStockView, StockAdjustmentView

urlpatterns = [
    path('', WarehouseListView.as_view(), name='warehouse-list'),
    path('<str:warehouse_id>/', WarehouseDetailView.as_view(), name='warehouse-detail'),
    path('<str:warehouse_id>/stock/', WarehouseStockView.as_view(), name='warehouse-stock'),
    path('<str:warehouse_id>/stock/adjust/', StockAdjustmentView.as_view(), name='stock-adjustment'),
]
