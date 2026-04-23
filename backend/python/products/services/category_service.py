from typing import List
from products.repositories.category_repository import ProductCategoryRepository
from products.schemas.category_schemas import (
    CategoryCreateRequest,
    CategoryUpdateRequest,
    CategoryResponse,
)

class NotFoundError(Exception):
    pass

class ValidationError(Exception):
    pass

class ProductCategoryService:
    def __init__(self, repo: ProductCategoryRepository):
        self.repo = repo

    def create_category(self, req: CategoryCreateRequest) -> CategoryResponse:
        # Check if title is provided (description is optional)
        if not req.title:
            raise ValidationError("Category title is required")

        # Check if category already exists
        existing = self.repo.get_by_title(req.title)
        if existing:
            raise ValidationError("this category is already being created")
            
        data = req.model_dump()
        doc = self.repo.create(data)
        return self._to_response(doc)

    def list_categories(self) -> List[CategoryResponse]:
        docs = self.repo.list_all()
        return [self._to_response(d) for d in docs]

    def get_category(self, category_id: str) -> CategoryResponse:
        doc = self.repo.get_by_id(category_id)
        if not doc:
            raise NotFoundError("Category not found")
        return self._to_response(doc)

    def update_category(self, category_id: str, req: CategoryUpdateRequest) -> CategoryResponse:
        patch = {k: v for k, v in req.model_dump().items() if v is not None}
        if not patch:
            raise ValidationError("No valid fields provided for update")

        doc = self.repo.update(category_id, patch)
        if not doc:
            raise NotFoundError("Category not found")
        return self._to_response(doc)

    def delete_category(self, category_id: str) -> None:
        # Before deleting, reassign products to "General"
        gen_cat = self.get_or_create_general_category()
        if gen_cat.id == category_id:
            raise ValidationError("Cannot delete the General category")

        from products.repositories.product_repository import ProductRepository
        from bson import ObjectId
        product_repo = ProductRepository()
        products = product_repo.list_by_category(category_id)
        
        gen_cat_id = ObjectId(gen_cat.id)
        for p in products:
            product_repo.update(str(p.id), {"category_id": gen_cat_id})

        ok = self.repo.delete(category_id)
        if not ok:
            raise NotFoundError("Category not found")

    def add_product_to_category(self, category_id: str, product_id: str) -> bool:
        from products.repositories.product_repository import ProductRepository
        from bson import ObjectId
        
        # Verify category exists
        if not self.repo.get_by_id(category_id):
            raise NotFoundError("Category not found")
        
        product_repo = ProductRepository()
        product = product_repo.get_by_id(product_id)
        if not product:
            raise NotFoundError("Product not found")
            
        product_repo.update(product_id, {"category_id": ObjectId(category_id)})
        return True

    def remove_product_from_category(self, category_id: str, product_id: str) -> bool:
        from products.repositories.product_repository import ProductRepository
        from bson import ObjectId
        
        product_repo = ProductRepository()
        product = product_repo.get_by_id(product_id)
        if not product:
            raise NotFoundError("Product not found")
            
        if not product.category_id or str(product.category_id.id) != category_id:
            raise ValidationError("Product is not in this category")
            
        gen_cat = self.get_or_create_general_category()
        product_repo.update(product_id, {"category_id": ObjectId(gen_cat.id)})
        return True

    def get_or_create_general_category(self) -> CategoryResponse:
        from products.db.category_document import ProductCategoryDocument
        doc = ProductCategoryDocument.objects(title="General").first()
        if not doc:
            doc = self.repo.create({
                "title": "General",
                "description": "Default category for products"
            })
        return self._to_response(doc)

    def seed_categories(self):
        defaults = [
            {"title": "General", "description": "Default category for products"},
            {"title": "Electronics", "description": "Gadgets, devices and appliances"},
            {"title": "Furniture", "description": "Home and office furniture"},
            {"title": "Clothing", "description": "Apparel and accessories"},
            {"title": "Grocery", "description": "Food and daily essentials"}
        ]
        count = 0
        for item in defaults:
            if not self.repo.get_by_title(item["title"]):
                self.repo.create(item)
                count += 1
        return count

    def _to_response(self, doc) -> CategoryResponse:
        return CategoryResponse(
            id=str(doc.id),
            title=doc.title,
            description=doc.description or "",
            created_at=doc.created_at.isoformat(),
            updated_at=doc.updated_at.isoformat(),
        )
