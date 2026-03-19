from products.tests.integration_base import IntegrationBase
from products.schemas.product_schemas import ProductCreateRequest
from products.schemas.category_schemas import CategoryCreateRequest

class TestProductIntegration(IntegrationBase):
    def test_create_product_and_verify_persistence(self):
        # 1. Create a category
        cat_req = CategoryCreateRequest(title="Tech", description="Gadgets")
        cat_res = self.cat_service.create_category(cat_req)
        
        # 2. Create a product in that category
        prod_req = ProductCreateRequest(
            name="iPhone 15",
            description="Latest smartphone",
            brand="Apple",
            category_id=cat_res.id,
            price=999.99,
            quantity=10
        )
        prod_res = self.product_service.create_product(prod_req)
        
        # 3. Verify it's in the database via repository
        from products.db.product_document import ProductDocument
        doc = ProductDocument.objects(name="iPhone 15").first()
        
        self.assertIsNotNone(doc)
        self.assertEqual(doc.brand, "Apple")
        self.assertEqual(str(doc.category_id.id), cat_res.id)

    def test_rich_filtering_integration(self):
        # 1. Seed data
        self.seed_data()
        
        # 2. Test filtering by category 'Electronics' (from seeds)
        electronics_cat = self.cat_repo.get_by_title("Electronics")
        filters = {"category_ids": [str(electronics_cat.id)]}
        products = self.product_service.list_products(filters)
        
        # We expect at least 'Wireless Mouse' and 'Gaming Keyboard' from seed_products
        self.assertGreaterEqual(len(products), 2)
        for p in products:
            self.assertEqual(p.category_id, str(electronics_cat.id))

    def test_search_by_brand_integration(self):
        self.seed_data()
        
        # Search for 'Logitech'
        filters = {"search": "Logitech"}
        products = self.product_service.list_products(filters)
        
        self.assertGreaterEqual(len(products), 1)
        self.assertEqual(products[0].brand, "Logitech")
        self.assertIn("Wireless Mouse", products[0].name)

    def test_category_deletion_reassignment_integration(self):
        self.seed_data()
        
        # Find 'Electronics' category and a product in it
        electronics_cat = self.cat_repo.get_by_title("Electronics")
        prod_before = self.product_repo.list_by_category(str(electronics_cat.id))[0]
        
        # Delete the category
        self.cat_service.delete_category(str(electronics_cat.id))
        
        # Verify product is now in 'General'
        gen_cat = self.cat_repo.get_by_title("General")
        from products.db.product_document import ProductDocument
        prod_after = ProductDocument.objects(id=prod_before.id).first()
        
        self.assertEqual(str(prod_after.category_id.id), str(gen_cat.id))
