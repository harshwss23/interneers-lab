import requests
import json
import csv
import io

BASE_URL = "http://127.0.0.1:8001/api"

def test_categories_crud():
    print("\n--- Testing Categories CRUD ---")
    # 1. Create Category
    cat_data = {"title": "Test Category", "description": "Testing category CRUD"}
    resp = requests.post(f"{BASE_URL}/categories/", json=cat_data)
    print(f"Create Category: {resp.status_code}")
    cat_id = resp.json()["data"]["id"]

    # 2. List Categories
    resp = requests.get(f"{BASE_URL}/categories/")
    print(f"List Categories: {resp.status_code} (Count: {len(resp.json()['data'])})")

    # 3. Get Category
    resp = requests.get(f"{BASE_URL}/categories/{cat_id}/")
    print(f"Get Category: {resp.status_code}")

    # 4. Update Category
    update_data = {"description": "Updated description"}
    resp = requests.patch(f"{BASE_URL}/categories/{cat_id}/", json=update_data)
    print(f"Update Category: {resp.status_code}")
    
    return cat_id

def test_product_with_category(cat_id):
    print("\n--- Testing Product with Category ---")
    product_data = {
        "name": "Test Product",
        "description": "Product belonging to test cat",
        "brand": "Test Brand",
        "category_id": cat_id,
        "price": 99.99,
        "quantity": 10
    }
    resp = requests.post(f"{BASE_URL}/products/", json=product_data)
    print(f"Create Product with Category: {resp.status_code}")
    product = resp.json()["data"]
    print(f"Assigned Category ID: {product.get('category_id')}")

def test_filtering(cat_id):
    print("\n--- Testing Product Filtering ---")
    resp = requests.get(f"{BASE_URL}/products/", params={"category_id": cat_id})
    print(f"Filter by Category: {resp.status_code} (Found: {len(resp.json()['data'])})")

def test_bulk_upload(cat_id):
    print("\n--- Testing Bulk Upload ---")
    csv_content = f"name,description,brand,category_id,price,quantity\nBulk 1,Desc 1,Brand A,{cat_id},10.0,5\nBulk 2,Desc 2,Brand B,{cat_id},20.0,10"
    files = {"file": ("products.csv", io.StringIO(csv_content))}
    resp = requests.post(f"{BASE_URL}/products/bulk/", files=files)
    print(f"Bulk Upload: {resp.status_code} (Created: {len(resp.json()['data'])})")

if __name__ == "__main__":
    try:
        cat_id = test_categories_crud()
        test_product_with_category(cat_id)
        test_filtering(cat_id)
        test_bulk_upload(cat_id)
    except Exception as e:
        print(f"Test failed: {str(e)}")
        print("Make sure the Django server is running on port 8001")
