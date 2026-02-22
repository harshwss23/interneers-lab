from rest_framework import serializers

ALLOWED_CATEGORIES = {"electronics", "grocery", "fashion", "stationery", "other"}

class ProductCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    description = serializers.CharField(allow_blank=True, required=False, default="")
    category = serializers.CharField(max_length=80)
    price = serializers.FloatField()
    brand = serializers.CharField(max_length=80, allow_blank=True, required=False, default="")
    quantity = serializers.IntegerField(min_value=0)

    def validate_category(self, value: str):
        v = value.strip().lower()
        if v not in ALLOWED_CATEGORIES:
            raise serializers.ValidationError(
                f"Invalid category. Allowed: {sorted(ALLOWED_CATEGORIES)}"
            )
        return v

    def validate_price(self, value: float):
        if value < 0:
            raise serializers.ValidationError("price must be >= 0")
        return value


class ProductUpdateSerializer(serializers.Serializer):
    # PATCH style: all optional
    name = serializers.CharField(max_length=120, required=False)
    description = serializers.CharField(allow_blank=True, required=False)
    category = serializers.CharField(max_length=80, required=False)
    price = serializers.FloatField(required=False)
    brand = serializers.CharField(max_length=80, allow_blank=True, required=False)
    quantity = serializers.IntegerField(min_value=0, required=False)

    def validate_category(self, value: str):
        v = value.strip().lower()
        if v not in ALLOWED_CATEGORIES:
            raise serializers.ValidationError(
                f"Invalid category. Allowed: {sorted(ALLOWED_CATEGORIES)}"
            )
        return v

    def validate_price(self, value: float):
        if value < 0:
            raise serializers.ValidationError("price must be >= 0")
        return value