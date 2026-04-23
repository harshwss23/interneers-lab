from rest_framework import serializers
from .models import Order
from products.models import Product

class OrderSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    username = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = Order
        fields = ['id', 'product', 'product_name', 'user', 'username', 'quantity', 'address', 'payment_details', 'status', 'created_at']
        read_only_fields = ['id', 'user', 'status', 'created_at']
