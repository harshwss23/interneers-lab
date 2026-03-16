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
        ok = self.repo.delete(category_id)
        if not ok:
            raise NotFoundError("Category not found")

    def _to_response(self, doc) -> CategoryResponse:
        return CategoryResponse(
            id=str(doc.id),
            title=doc.title,
            description=doc.description or "",
            created_at=doc.created_at.isoformat(),
            updated_at=doc.updated_at.isoformat(),
        )
