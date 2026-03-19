import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_add_remove():
    print("--- Testing Add/Remove Product from Category ---")
    
    # 1. Create a category
    res = requests.post(f"{BASE_URL}/categories/", json={"title": "AddRemoveCat", "description": "Test"})
    cat_id = res.json().get("data", {}).get("id")
    print(f"Category Created: {cat_id}")
    
    # 2. Create a product (defaults to General)
    res = requests.post(f"{BASE_URL}/products/", json={
        "name": "Moving Product", "description": "test", "brand": "test", "price": 10, "quantity": 1
    })
    prod_id = res.json().get("data", {}).get("id")
    print(f"Product Created: {prod_id}")
    
    # 3. Add to category
    res = requests.post(f"{BASE_URL}/categories/{cat_id}/products/{prod_id}/")
    print(f"Add Product to Category: {res.status_code}")
    
    # 4. Verify
    res = requests.get(f"{BASE_URL}/products/{prod_id}/")
    current_cat = res.json().get("data", {}).get("category_id")
    print(f"Current Category ID: {current_cat} (Expected: {cat_id})")
    
    # 5. Remove from category
    res = requests.delete(f"{BASE_URL}/categories/{cat_id}/products/{prod_id}/")
    print(f"Remove Product from Category: {res.status_code}")
    
    # 6. Verify moved to General
    res = requests.get(f"{BASE_URL}/products/{prod_id}/")
    new_cat = res.json().get("data", {}).get("category_id")
    print(f"New Category ID: {new_cat}")
    
    # Get General Category ID for comparison
    cats = requests.get(f"{BASE_URL}/categories/").json().get("data", [])
    gen_cat_id = next(c["id"] for c in cats if c["title"] == "General")
    print(f"General Category ID: {gen_cat_id}")
    
    if new_cat == gen_cat_id:
        print("Success: Product moved back to General category.")
    else:
        print("Failure: Product not in General category.")

if __name__ == "__main__":
    test_add_remove()
