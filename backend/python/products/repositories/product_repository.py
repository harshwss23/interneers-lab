from datetime import datetime, timezone
from typing import List, Optional
from bson import ObjectId
from mongoengine.errors import DoesNotExist
from products.db.product_document import ProductDocument

class ProductRepository:
    def create(self, data: dict) -> ProductDocument:
        # Save to MongoDB
        doc = ProductDocument(**data)
        doc.created_at = datetime.now(timezone.utc)
        doc.updated_at = datetime.now(timezone.utc)
        doc.save()

        # Save to SQL for Analytics
        try:
            from products.models import Product
            from accounts.models import User
            from products.db.category_document import ProductCategoryDocument
            
            # Resolve User
            user = None
            created_by_username = data.get("created_by")
            if created_by_username:
                user = User.objects.filter(username=created_by_username).first()
            
            # Resolve Category name
            cat_name = "General"
            cat_id = data.get("category_id")
            if cat_id:
                # MongoEngine syntax fix: use objects(id=...)
                cat_doc = ProductCategoryDocument.objects(id=cat_id).first()
                if cat_doc:
                    cat_name = cat_doc.title

            Product.objects.create(
                name=data.get("name"),
                description=data.get("description", ""),
                category=cat_name,
                price=data.get("price", 0),
                brand=data.get("brand", ""),
                quantity=data.get("quantity", 0),
                created_by=user
            )
            print(f"Successfully synced product '{data.get('name')}' to SQL.")
        except Exception as e:
            import traceback
            print(f"Error syncing to SQL on create: {e}")
            traceback.print_exc()
            
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

        old_name = doc.name

        for k, v in patch.items():
            if k == "category_id" and v:
                v = ObjectId(v)
            setattr(doc, k, v)

        doc.updated_at = datetime.now(timezone.utc)
        doc.save()

        # Update SQL
        try:
            from products.models import Product
            # Find SQL product by old name (link)
            sql_prod = Product.objects.filter(name=old_name).first()
            if sql_prod:
                if "name" in patch: sql_prod.name = patch["name"]
                if "description" in patch: sql_prod.description = patch["description"]
                if "price" in patch: sql_prod.price = patch["price"]
                if "brand" in patch: sql_prod.brand = patch["brand"]
                if "quantity" in patch: sql_prod.quantity = patch["quantity"]
                if "category_id" in patch:
                    from products.db.category_document import ProductCategoryDocument
                    cat_doc = ProductCategoryDocument.objects.filter(id=patch["category_id"]).first()
                    if cat_doc:
                        sql_prod.category = cat_doc.title
                sql_prod.save()
        except Exception as e:
            print(f"Error syncing to SQL on update: {e}")

        return doc

    def delete(self, product_id: str) -> bool:
        doc = self.get_by_id(product_id)
        if not doc:
            return False
        
        name_to_delete = doc.name
        doc.delete()

        # Delete SQL
        try:
            from products.models import Product
            Product.objects.filter(name=name_to_delete).delete()
        except Exception as e:
            print(f"Error syncing to SQL on delete: {e}")

        return True