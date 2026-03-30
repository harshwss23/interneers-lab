from products.repositories.product_repository import ProductRepository
from products.schemas.product_schemas import ProductCreateRequest

class ProductService:
    def __init__(self, repo: ProductRepository):
        self.repo = repo

    def create_product(self, req: ProductCreateRequest, created_by_user_id: str) -> dict:
        payload = req.model_dump()
        payload["created_by_user_id"] = created_by_user_id

        doc = self.repo.create(payload)
        return {
            "id": str(doc.id),
            "name": doc.name,
            "description": doc.description or "",
            "brand": doc.brand,
            "price": float(doc.price),
            "quantity": int(doc.quantity),
            "category_id": doc.category_id,
            "created_by_user_id": doc.created_by_user_id,
            "created_at": doc.created_at.isoformat(),
            "updated_at": doc.updated_at.isoformat(),
        }