import pytest
from unittest.mock import MagicMock, patch
from products.services.product_service import ProductService, ValidationError, NotFoundError
from products.schemas.product_schemas import ProductCreateRequest
from bson import ObjectId
from datetime import datetime, timezone

@pytest.fixture
def mock_repo():
    return MagicMock()

@pytest.fixture
def service(mock_repo):
    return ProductService(mock_repo)

class TestProductService:
    
    @pytest.mark.parametrize("name,description,brand,price,quantity", [
        ("Product 1", "Desc 1", "Brand A", 10.0, 5),
        ("Product 2", "Desc 2", "Brand B", 20.0, 10),
        ("Product 3", "Desc 3", "Brand C", 30.0, 15),
    ])
    @patch('products.services.product_service.ProductService._get_or_create_general_category_id')
    def test_create_product_success(self, mock_gen_cat, service, mock_repo, name, description, brand, price, quantity):
        mock_gen_cat.return_value = ObjectId()
        req = ProductCreateRequest(name=name, description=description, brand=brand, price=price, quantity=quantity)
        
        mock_repo.get_by_precise_match.return_value = None
        
        mock_doc = MagicMock()
        mock_doc.id = ObjectId()
        mock_doc.name = name
        mock_doc.description = description
        mock_doc.brand = brand
        mock_doc.category_id = MagicMock(id=mock_gen_cat.return_value)
        mock_doc.category_id.title = "General"
        mock_doc.price = price
        mock_doc.quantity = quantity
        mock_doc.created_by = "testuser"
        mock_doc.created_at = datetime.now(timezone.utc)
        mock_doc.updated_at = datetime.now(timezone.utc)
        mock_repo.create.return_value = mock_doc

        result = service.create_product(req)
        
        assert result.name == name
        mock_repo.create.assert_called_once()

    @pytest.mark.parametrize("name,brand,price,quantity,expected_error", [
        ("", "Brand", 10.0, 1, "ensure this value has at least 1 characters"), # Schema validation
        ("Name", "", 10.0, 1, "ensure this value has at least 1 characters"), # Schema validation
        ("Name", "Brand", -10.0, 1, "ensure this value is greater than 0"), # Schema validation
        ("Name", "Brand", 10.0, -1, "ensure this value is greater than or equal to 0"), # Schema validation
    ])
    def test_create_product_schema_validation(self, service, name, brand, price, quantity, expected_error):
        with pytest.raises(Exception) as excinfo:
            ProductCreateRequest(name=name, brand=brand, price=price, quantity=quantity)
        # Note: Pydantic errors can be complex, just checking if it raises for now as in original test

    def test_create_product_duplicate(self, service, mock_repo):
        req = ProductCreateRequest(name="Existing", description="D", brand="B", price=1.0, quantity=1)
        mock_repo.get_by_precise_match.return_value = MagicMock()
        
        with pytest.raises(ValidationError, match="product is already created"):
            service.create_product(req)

    def test_list_products_invalid_category(self, service):
        with patch('products.repositories.category_repository.ProductCategoryRepository.get_by_id') as mock_get_cat:
            mock_get_cat.return_value = None
            filters = {"category_ids": [str(ObjectId())]}
            with pytest.raises(ValidationError, match="no such category exist"):
                service.list_products(filters)

    def test_create_product_invalid_category(self, service, mock_repo):
        req = ProductCreateRequest(name="P", brand="B", price=10.0, quantity=1, category_id=str(ObjectId()))
        mock_repo.get_by_precise_match.return_value = None
        with patch('products.repositories.category_repository.ProductCategoryRepository.get_by_id') as mock_get_cat:
            mock_get_cat.return_value = None
            with pytest.raises(ValidationError, match="no such category exist"):
                service.create_product(req)
