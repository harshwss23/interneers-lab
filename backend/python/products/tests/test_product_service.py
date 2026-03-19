import unittest
from unittest.mock import MagicMock, patch
from products.services.product_service import ProductService, ValidationError, NotFoundError
from products.schemas.product_schemas import ProductCreateRequest
from bson import ObjectId
from datetime import datetime

class TestProductService(unittest.TestCase):
    def setUp(self):
        self.mock_repo = MagicMock()
        self.service = ProductService(self.mock_repo)

    @patch('products.services.product_service.ProductService._get_or_create_general_category_id')
    def test_create_product_success(self, mock_gen_cat):
        mock_gen_cat.return_value = ObjectId()
        req = ProductCreateRequest(name="New Product", description="Desc", brand="Brand", price=10.0, quantity=5)
        
        self.mock_repo.get_by_precise_match.return_value = None
        
        mock_doc = MagicMock()
        mock_doc.id = ObjectId()
        mock_doc.name = "New Product"
        mock_doc.description = "Desc"
        mock_doc.brand = "Brand"
        mock_doc.category_id = MagicMock(id=mock_gen_cat.return_value)
        mock_doc.price = 10.0
        mock_doc.quantity = 5
        mock_doc.created_at = datetime.utcnow()
        mock_doc.updated_at = datetime.utcnow()
        self.mock_repo.create.return_value = mock_doc

        result = self.service.create_product(req)
        
        self.assertEqual(result.name, "New Product")
        self.mock_repo.create.assert_called_once()

    def test_create_product_duplicate(self):
        req = ProductCreateRequest(name="Existing", description="D", brand="B", price=1.0, quantity=1)
        self.mock_repo.get_by_precise_match.return_value = MagicMock()
        
        with self.assertRaisesRegex(ValidationError, "product is already created"):
            self.service.create_product(req)

    def test_list_products_invalid_category(self):
        # Mocking the repository used for validation inside list_products
        with patch('products.repositories.category_repository.ProductCategoryRepository.get_by_id') as mock_get_cat:
            mock_get_cat.return_value = None
            filters = {"category_ids": [str(ObjectId())]}
            with self.assertRaisesRegex(ValidationError, "no such category exist"):
                self.service.list_products(filters)

    def test_create_product_invalid_data(self):
        # Parameterized validation testing using subTest
        cases = [
            ("negative_price", {"name": "A", "brand": "B", "price": -10.0, "quantity": 1}),
            ("empty_name", {"name": "", "brand": "B", "price": 10.0, "quantity": 1}),
            ("empty_brand", {"name": "A", "brand": "", "price": 10.0, "quantity": 1}),
        ]
        for name, data in cases:
            with self.subTest(case=name):
                with self.assertRaises(Exception): # Pydantic ValidationError
                    ProductCreateRequest(**data)


    def test_create_product_invalid_category(self):
        req = ProductCreateRequest(name="P", brand="B", price=10.0, quantity=1, category_id=str(ObjectId()))
        self.mock_repo.get_by_precise_match.return_value = None
        with patch('products.repositories.category_repository.ProductCategoryRepository.get_by_id') as mock_get_cat:
            mock_get_cat.return_value = None
            with self.assertRaisesRegex(ValidationError, "no such category exist"):
                self.service.create_product(req)


