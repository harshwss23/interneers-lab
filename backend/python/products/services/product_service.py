from typing import List
from products.repositories.product_repository import ProductRepository
from products.schemas.product_schemas import (
    ProductCreateRequest,
    ProductUpdateRequest,
    ProductResponse,
)

class NotFoundError(Exception):
    pass

class ValidationError(Exception):
    pass

class ProductService:
    def __init__(self, repo: ProductRepository):
        self.repo = repo

    def create_product(self, req: ProductCreateRequest) -> ProductResponse:
        # Check if product already exists (precise match by name, description, and brand)
        existing = self.repo.get_by_precise_match(req.name, req.description or "", req.brand)
        if existing:
            raise ValidationError(f"product is already created, u can upadte that existing or first delete that product first")

        data = req.model_dump()
        if not data.get("category_id"):
            data["category_id"] = self._get_or_create_general_category_id()
        else:
            # Check if category exists
            from products.repositories.category_repository import ProductCategoryRepository
            cat_repo = ProductCategoryRepository()
            if not cat_repo.get_by_id(data["category_id"]):
                raise ValidationError("no such category exist")
            
            from bson import ObjectId
            data["category_id"] = ObjectId(data["category_id"])
        
        doc = self.repo.create(data)
        return self._to_response(doc)

    def _get_or_create_general_category_id(self):
        from products.services.category_service import ProductCategoryService
        from products.repositories.category_repository import ProductCategoryRepository
        cat_service = ProductCategoryService(ProductCategoryRepository())
        gen_cat = cat_service.get_or_create_general_category()
        from bson import ObjectId
        return ObjectId(gen_cat.id)

    def list_products(self, filters: dict = None) -> List[ProductResponse]:
        if filters and "category_ids" in filters:
            from products.repositories.category_repository import ProductCategoryRepository
            cat_repo = ProductCategoryRepository()
            for cat_id in filters["category_ids"]:
                if not cat_repo.get_by_id(cat_id):
                    raise ValidationError("no such category exist")

        if filters:
            docs = self.repo.filter_products(filters)
        else:
            docs = self.repo.list_all()
        return [self._to_response(d) for d in docs]

    def list_products_by_category(self, category_id: str) -> List[ProductResponse]:
        docs = self.repo.list_by_category(category_id)
        return [self._to_response(d) for d in docs]

    def get_product(self, product_id: str) -> ProductResponse:
        doc = self.repo.get_by_id(product_id)
        if not doc:
            raise NotFoundError("Product not found")
        return self._to_response(doc)

    def update_product(self, product_id: str, req: ProductUpdateRequest) -> ProductResponse:
        patch = {k: v for k, v in req.model_dump().items() if v is not None}
        if not patch:
            raise ValidationError("No valid fields provided for update")

        doc = self.repo.update(product_id, patch)
        if not doc:
            raise NotFoundError("Product not found")
        return self._to_response(doc)

    def create_products_bulk(self, products_data: List[dict]) -> dict:
        created_products = []
        errors = []
        
        for i, data in enumerate(products_data):
            # Check for existing product by name, description, and brand
            if data.get("name"):
                existing = self.repo.get_by_precise_match(
                    data["name"], 
                    data.get("description", ""), 
                    data.get("brand", "")
                )
                if existing:
                    errors.append({
                        "row_index": i,
                        "error": "product is already created, u can upadte that existing or first delete that product first",
                        "data": data
                    })
                    continue

            # Validation for name, description, and brand
            missing_fields = []
            if not data.get("name"): missing_fields.append("name")
            if not data.get("description"): missing_fields.append("description")
            if not data.get("brand"): missing_fields.append("brand")
            
            if missing_fields:
                errors.append({
                    "row_index": i,
                    "error": "all name, description and brand should be mentioned",
                    "missing_fields": missing_fields,
                    "data": data
                })
                continue

            try:
                if not data.get("category_id"):
                    data["category_id"] = self._get_or_create_general_category_id()
                else:
                    # Check if category exists
                    from products.repositories.category_repository import ProductCategoryRepository
                    cat_repo = ProductCategoryRepository()
                    if not cat_repo.get_by_id(data["category_id"]):
                        errors.append({
                            "row_index": i,
                            "error": "no such category exists",
                            "data": data
                        })
                        continue

                    from bson import ObjectId
                    data["category_id"] = ObjectId(data["category_id"])
                
                doc = self.repo.create(data)
                created_products.append(self._to_response(doc))
            except Exception as e:
                errors.append({
                    "row_index": i,
                    "error": str(e),
                    "data": data
                })
        
        return {
            "created": created_products,
            "errors": errors
        }

    def ensure_all_products_have_category(self):
        gen_cat_id = self._get_or_create_general_category_id()
        all_products = self.repo.list_all()
        count = 0
        for doc in all_products:
            if not doc.category_id:
                self.repo.update(str(doc.id), {"category_id": gen_cat_id})
                count += 1
        return count

    def seed_products(self):
        from products.repositories.category_repository import ProductCategoryRepository
        cat_repo = ProductCategoryRepository()
        
        def get_cat_id(title):
            cat = cat_repo.get_by_title(title)
            return cat.id if cat else None

        defaults = [
            {"name": "Wireless Mouse", "description": "Ergonomic wireless mouse", "brand": "Logitech", "category_title": "Electronics", "price": 25.99, "quantity": 50},
            {"name": "Gaming Keyboard", "description": "Mechanical RGB keyboard", "brand": "Razer", "category_title": "Electronics", "price": 89.99, "quantity": 30},
            {"name": "Office Chair", "description": "Ergonomic office chair", "brand": "Herman Miller", "category_title": "Furniture", "price": 499.99, "quantity": 10},
            {"name": "T-Shirt", "description": "Cotton crew neck t-shirt", "brand": "Uniqlo", "category_title": "Clothing", "price": 19.99, "quantity": 100},
            {"name": "Milk", "description": "Fresh whole milk 1L", "brand": "Amul", "category_title": "Grocery", "price": 1.50, "quantity": 200}
        ]
        
        count = 0
        from bson import ObjectId
        for item in defaults:
            # Check if already exists
            existing = self.repo.get_by_precise_match(item["name"], item["description"], item["brand"])
            if not existing:
                cat_id = get_cat_id(item["category_title"])
                if not cat_id:
                    cat_id = self._get_or_create_general_category_id()
                
                data = item.copy()
                data.pop("category_title")
                data["category_id"] = ObjectId(cat_id)
                self.repo.create(data)
                count += 1
        return count

    def delete_product(self, product_id: str) -> None:
        ok = self.repo.delete(product_id)
        if not ok:
            raise NotFoundError("Product not found")

    def _to_response(self, doc) -> ProductResponse:
        return ProductResponse(
            id=str(doc.id),
            name=doc.name,
            description=doc.description or "",
            brand=doc.brand,
            category_id=str(doc.category_id.id) if doc.category_id else None,
            price=float(doc.price),
            quantity=int(doc.quantity),
            created_at=doc.created_at.isoformat(),
            updated_at=doc.updated_at.isoformat(),
        )