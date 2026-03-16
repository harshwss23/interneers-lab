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
        data = req.model_dump()
        if data.get("category_id"):
            from bson import ObjectId
            data["category_id"] = ObjectId(data["category_id"])
        doc = self.repo.create(data)
        return self._to_response(doc)

    def list_products(self, filters: dict = None) -> List[ProductResponse]:
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

    def create_products_bulk(self, products_data: List[dict]) -> List[ProductResponse]:
        created_products = []
        for data in products_data:
            # Basic validation/defaulting for brand as per requirement
            if not data.get("brand"):
                data["brand"] = "Unknown"
            
            if data.get("category_id"):
                from bson import ObjectId
                data["category_id"] = ObjectId(data["category_id"])
            
            doc = self.repo.create(data)
            created_products.append(self._to_response(doc))
        return created_products

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