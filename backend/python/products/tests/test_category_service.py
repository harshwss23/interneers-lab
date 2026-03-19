import unittest
from unittest.mock import MagicMock
from products.services.category_service import ProductCategoryService, ValidationError, NotFoundError
from products.schemas.category_schemas import CategoryCreateRequest, CategoryUpdateRequest
from bson import ObjectId
from datetime import datetime

class TestProductCategoryService(unittest.TestCase):
    def setUp(self):
        self.mock_repo = MagicMock()
        self.service = ProductCategoryService(self.mock_repo)

    def test_create_category_success(self):
        req = CategoryCreateRequest(title="Test Cat", description="Test Desc")
        self.mock_repo.get_by_title.return_value = None
        
        mock_doc = MagicMock()
        mock_doc.id = ObjectId()
        mock_doc.title = "Test Cat"
        mock_doc.description = "Test Desc"
        mock_doc.created_at = datetime.utcnow()
        mock_doc.updated_at = datetime.utcnow()
        self.mock_repo.create.return_value = mock_doc

        result = self.service.create_category(req)
        
        self.assertEqual(result.title, "Test Cat")
        self.mock_repo.create.assert_called_once()

    def test_create_category_missing_fields(self):
        req = CategoryCreateRequest(title="A") 
        with self.assertRaisesRegex(ValidationError, "Kindly Provie both Fields"):
            self.service.create_category(req)

    def test_create_category_duplicate_title(self):
        req = CategoryCreateRequest(title="Duplicate", description="Desc")
        self.mock_repo.get_by_title.return_value = MagicMock() # Exists
        
        with self.assertRaisesRegex(ValidationError, "this category is already being created"):
            self.service.create_category(req)

    def test_add_product_to_category_category_not_found(self):
        self.mock_repo.get_by_id.return_value = None
        with self.assertRaisesRegex(NotFoundError, "Category not found"):
            self.service.add_product_to_category(str(ObjectId()), str(ObjectId()))
