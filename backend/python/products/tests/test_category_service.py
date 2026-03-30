import pytest
from unittest.mock import MagicMock, patch
from products.services.category_service import ProductCategoryService, ValidationError, NotFoundError
from products.schemas.category_schemas import CategoryCreateRequest, CategoryUpdateRequest
from bson import ObjectId
from datetime import datetime

@pytest.fixture
def mock_repo():
    return MagicMock()

@pytest.fixture
def service(mock_repo):
    return ProductCategoryService(mock_repo)

class TestProductCategoryService:
    
    @pytest.mark.parametrize("title,description", [
        ("Electronics", "Gadgets and more"),
        ("Furniture", "Home and Office"),
        ("Grocery", "Daily Essentials"),
    ])
    def test_create_category_success(self, service, mock_repo, title, description):
        req = CategoryCreateRequest(title=title, description=description)
        mock_repo.get_by_title.return_value = None
        
        mock_doc = MagicMock()
        mock_doc.id = ObjectId()
        mock_doc.title = title
        mock_doc.description = description
        mock_doc.created_at = datetime.now(timezone.utc)
        mock_doc.updated_at = datetime.now(timezone.utc)
        mock_repo.create.return_value = mock_doc

        result = service.create_category(req)
        
        assert result.title == title
        mock_repo.create.assert_called_once()

    @pytest.mark.parametrize("title,description,expected_exc,match", [
        ("Test", "", ValidationError, "Kindly Provie both Fields"), # Service validation
        ("", "Desc", Exception, "at least 1 character"), # Schema validation (pydantic)
    ])
    def test_create_category_invalid_data(self, service, title, description, expected_exc, match):
        if expected_exc is ValidationError:
            req = CategoryCreateRequest(title=title, description=description)
            with pytest.raises(ValidationError, match=match):
                service.create_category(req)
        else:
            with pytest.raises(Exception, match=match):
                CategoryCreateRequest(title=title, description=description)

    def test_create_category_duplicate_title(self, service, mock_repo):
        req = CategoryCreateRequest(title="Duplicate", description="Desc")
        mock_repo.get_by_title.return_value = MagicMock() # Exists
        
        with pytest.raises(ValidationError, match="this category is already being created"):
            service.create_category(req)

    def test_list_categories_success(self, service, mock_repo):
        mock_docs = [MagicMock(id=ObjectId(), title=f"Cat {i}", description="Desc", created_at=datetime.now(timezone.utc), updated_at=datetime.now(timezone.utc)) for i in range(2)]
        mock_repo.list_all.return_value = mock_docs
        
        results = service.list_categories()
        assert len(results) == 2
        assert results[0].title == "Cat 0"

    @pytest.mark.parametrize("exists", [True, False])
    def test_get_category(self, service, mock_repo, exists):
        cat_id = str(ObjectId())
        if exists:
            mock_doc = MagicMock(id=ObjectId(cat_id), title="C", description="D", created_at=datetime.now(timezone.utc), updated_at=datetime.now(timezone.utc))
            mock_repo.get_by_id.return_value = mock_doc
            result = service.get_category(cat_id)
            assert result.id == cat_id
        else:
            mock_repo.get_by_id.return_value = None
            with pytest.raises(NotFoundError, match="Category not found"):
                service.get_category(cat_id)

    def test_update_category_success(self, service, mock_repo):
        cat_id = str(ObjectId())
        req = CategoryUpdateRequest(title="New Name", description="New Desc")
        mock_doc = MagicMock(id=ObjectId(cat_id), title="New Name", description="New Desc", created_at=datetime.now(timezone.utc), updated_at=datetime.now(timezone.utc))
        mock_repo.update.return_value = mock_doc
        
        result = service.update_category(cat_id, req)
        assert result.title == "New Name"

    def test_delete_category_success(self, service, mock_repo):
        cat_id = str(ObjectId())
        # Mocking gen_cat to avoid actual DB call or recursion if not carefully mocked
        with patch.object(service, 'get_or_create_general_category') as mock_gen:
            mock_gen.return_value = MagicMock(id=str(ObjectId()))
            
            with patch('products.repositories.product_repository.ProductRepository') as mock_prod_repo_class:
                mock_prod_repo = mock_prod_repo_class.return_value
                mock_prod_repo.list_by_category.return_value = []
                
                mock_repo.delete.return_value = True
                service.delete_category(cat_id)
                mock_repo.delete.assert_called_once_with(cat_id)

    def test_add_product_to_category_success(self, service, mock_repo):
        cat_id = str(ObjectId())
        prod_id = str(ObjectId())
        mock_repo.get_by_id.return_value = MagicMock()
        
        with patch('products.repositories.product_repository.ProductRepository') as mock_prod_repo_class:
            mock_prod_repo = mock_prod_repo_class.return_value
            mock_prod_repo.get_by_id.return_value = MagicMock()
            mock_prod_repo.update.return_value = MagicMock()
            
            service.add_product_to_category(cat_id, prod_id)
            mock_prod_repo.update.assert_called_once()
