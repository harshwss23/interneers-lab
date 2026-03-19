import mongoengine
import unittest
from products.repositories.product_repository import ProductRepository
from products.repositories.category_repository import ProductCategoryRepository
from products.services.product_service import ProductService
from products.services.category_service import ProductCategoryService

class IntegrationBase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        mongoengine.disconnect(alias='default')
        mongoengine.connect('test_ims_db', host='localhost', port=27017, alias='default')
        
    @classmethod
    def tearDownClass(cls):
        mongoengine.disconnect(alias='default')

    def setUp(self):
        from products.db.product_document import ProductDocument
        from products.db.category_document import ProductCategoryDocument
        ProductDocument.objects.delete()
        ProductCategoryDocument.objects.delete()
        
        self.cat_repo = ProductCategoryRepository()
        self.cat_service = ProductCategoryService(self.cat_repo)
        self.product_repo = ProductRepository()
        self.product_service = ProductService(self.product_repo)

    def seed_data(self):
        self.cat_service.seed_categories()
        # Ensure 'General' exists specifically
        self.cat_service.get_or_create_general_category()
        self.product_service.seed_products()
