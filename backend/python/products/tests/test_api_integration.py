import json
from django.test import TestCase, Client
import mongoengine
from products.tests.integration_base import IntegrationBase

class TestAPIIntegration(TestCase, IntegrationBase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # Ensure we use the test database
        mongoengine.disconnect(alias='default')
        mongoengine.connect('test_ims_db', host='localhost', port=27017, alias='default')

    @classmethod
    def tearDownClass(cls):
        mongoengine.disconnect(alias='default')
        super().tearDownClass()

    def setUp(self):
        # Clean Mongo
        from products.db.product_document import ProductDocument
        from products.db.category_document import ProductCategoryDocument
        ProductDocument.objects.delete()
        ProductCategoryDocument.objects.delete()
        
        from rest_framework.test import APIClient
        from rest_framework.authtoken.models import Token
        from accounts.models import User
        
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.token = Token.objects.create(user=self.user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

    def test_end_to_end_product_flow(self):
        # 1. Create a category via API
        cat_data = {"title": "Appliance", "description": "Home appliances"}
        res = self.client.post("/api/categories/", data=json.dumps(cat_data), content_type="application/json")
        self.assertEqual(res.status_code, 201)
        cat_id = res.json()["data"]["id"]

        # 2. Create a product in that category via API
        prod_data = {
            "name": "Toaster",
            "description": "2-slice toaster",
            "brand": "Philips",
            "category_id": cat_id,
            "price": 45.0,
            "quantity": 20
        }
        res = self.client.post("/api/products/", data=json.dumps(prod_data), content_type="application/json")
        self.assertEqual(res.status_code, 201)
        prod_id = res.json()["data"]["id"]

        # 3. Retrieve product via API and verify
        res = self.client.get(f"/api/products/{prod_id}/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["data"]["name"], "Toaster")
        self.assertEqual(res.json()["data"]["category_id"], cat_id)

    def test_api_filtering_and_search(self):
        # Seed categories and products first
        from products.services.category_service import ProductCategoryService
        from products.services.product_service import ProductService
        from products.repositories.category_repository import ProductCategoryRepository
        from products.repositories.product_repository import ProductRepository
        
        cat_service = ProductCategoryService(ProductCategoryRepository())
        prod_service = ProductService(ProductRepository())
        cat_service.seed_categories()
        prod_service.seed_products()

        # 1. Search for 'Razer' (brand)
        res = self.client.get("/api/products/?search=Razer")
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertGreaterEqual(len(data), 1)
        self.assertEqual(data[0]["brand"], "Razer")

        # 2. Filter by Price Range
        res = self.client.get("/api/products/?min_price=10&max_price=30")
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        # Expected 'Wireless Mouse' ($25.99) and 'T-Shirt' ($19.99)
        self.assertGreaterEqual(len(data), 2)
        for item in data:
            self.assertTrue(10 <= item["price"] <= 30)

    def test_api_invalid_category_error(self):
        # Test the "no such category exist" error
        res = self.client.get("/api/products/?category_id=65f1234567890abcdef12345")
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json()["error"], "no such category exist")

    def test_api_category_deletion_impact(self):
        # 1. Setup: Create category and product
        cat_data = {"title": "Books", "description": "Readable items"}
        res = self.client.post("/api/categories/", data=json.dumps(cat_data), content_type="application/json")
        cat_id = res.json()["data"]["id"]
        
        prod_data = {"name": "Python 101", "brand": "OReilly", "price": 40.0, "quantity": 5, "category_id": cat_id}
        res = self.client.post("/api/products/", data=json.dumps(prod_data), content_type="application/json")
        prod_id = res.json()["data"]["id"]

        # 2. Add product to category (it's already there, but let's use the explicit endpoint)
        # Actually it's already in 'Books'.

        # 3. Delete the 'Books' category
        res = self.client.delete(f"/api/categories/{cat_id}/")
        self.assertEqual(res.status_code, 200)

        # 4. Verify product is now in 'General'
        res = self.client.get(f"/api/products/{prod_id}/")
        self.assertEqual(res.status_code, 200)
        
        # Get General Category ID
        from products.db.category_document import ProductCategoryDocument
        gen_cat = ProductCategoryDocument.objects(title="General").first()
        self.assertEqual(res.json()["data"]["category_id"], str(gen_cat.id))
