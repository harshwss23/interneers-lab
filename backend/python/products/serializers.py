from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'category', 
            'price', 'brand', 'quantity', 
            'created_by', 'created_by_username', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def validate_category(self, value):
        allowed = {"electronics", "grocery", "fashion", "stationery", "other"}
        if value.lower() not in allowed:
            raise serializers.ValidationError(f"Invalid category. Allowed: {sorted(allowed)}")
        return value.lower()

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price must be >= 0")
        return value