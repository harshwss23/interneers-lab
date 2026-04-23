from django.urls import path
from .views import OrderListCreateView, OrderApproveView
from .cart_views import CartView
from .analytics_views import AnalyticsOverviewView
from .reporting_views import ReportingView, CSVExportView, WarehouseSummaryView

urlpatterns = [
    path('', OrderListCreateView.as_view(), name='order-list-create'),
    path('<str:pk>/approve/', OrderApproveView.as_view(), name='order-approve'),
    path('cart/', CartView.as_view(), name='cart'),
    path('analytics/', AnalyticsOverviewView.as_view(), name='analytics'),
    path('reports/', ReportingView.as_view(), name='reports'),
    path('reports/warehouse-summary/', WarehouseSummaryView.as_view(), name='warehouse-summary'),
    path('reports/export/', CSVExportView.as_view(), name='reports-export'),
]
