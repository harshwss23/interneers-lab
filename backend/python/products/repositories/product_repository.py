from datetime import datetime, timezone
from typing import List, Optional
from bson import ObjectId
from mongoengine.errors import DoesNotExist
from products.db.product_document import ProductDocument

class ProductRepository:
    def create(self, data: dict) -> ProductDocument:
        doc = ProductDocument(**data)
        doc.created_at = datetime.now(timezone.utc)
        doc.updated_at = datetime.now(timezone.utc)
        doc.save()
        return doc

    def list_all(self) -> List[ProductDocument]:
        return list(ProductDocument.objects.order_by("-created_at"))

    def get_by_id(self, product_id: str) -> Optional[ProductDocument]:
        try:
            if not ObjectId.is_valid(product_id):
                return None
            return ProductDocument.objects.get(id=product_id)
        except DoesNotExist:
            return None

    def get_by_precise_match(self, name: str, description: str, brand: str) -> Optional[ProductDocument]:
        return ProductDocument.objects(name=name, description=description, brand=brand).first()

    def list_by_category(self, category_id: str) -> List[ProductDocument]:
        if not ObjectId.is_valid(category_id):
            return []
        return list(ProductDocument.objects(category_id=category_id).order_by("-created_at"))

    def filter_products(self, filters: dict) -> List[ProductDocument]:
        query = {}
        if "category_ids" in filters:
            valid_ids = [ObjectId(fid) for fid in filters["category_ids"] if ObjectId.is_valid(fid)]
            if valid_ids:
                query["category_id__in"] = valid_ids
        elif "category_id" in filters and filters["category_id"]:
            if ObjectId.is_valid(filters["category_id"]):
                query["category_id"] = ObjectId(filters["category_id"])
        
        if "brands" in filters:
            query["brand__in"] = filters["brands"]
        elif "brand" in filters:
            query["brand"] = filters["brand"]

        if "min_price" in filters:
            query["price__gte"] = float(filters["min_price"])
        if "max_price" in filters:
            query["price__lte"] = float(filters["max_price"])
            
        if "created_by" in filters:
            query["created_by"] = filters["created_by"]

        if "search" in filters:
            from mongoengine.queryset.visitor import Q
            search_term = filters["search"]
            search_query = Q(name__icontains=search_term) | Q(description__icontains=search_term) | Q(brand__icontains=search_term)
            return list(ProductDocument.objects(search_query, **query).order_by("-created_at"))
            
        return list(ProductDocument.objects(**query).order_by("-created_at"))

    def update(self, product_id: str, patch: dict) -> Optional[ProductDocument]:
        doc = self.get_by_id(product_id)
        if not doc:
            return None

        for k, v in patch.items():
            if k == "category_id" and v:
                v = ObjectId(v)
            setattr(doc, k, v)

        doc.updated_at = datetime.now(timezone.utc)
        doc.save()
        return doc

    def delete(self, product_id: str) -> bool:
        doc = self.get_by_id(product_id)
        if not doc:
            return False
        doc.delete()
        return True