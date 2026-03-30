import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_category_existence_validation():
    print("--- Testing Category Existence Validation ---")
    
    # Use a non-existent but valid ObjectId format
    non_existent_cat_id = "600000000000000000000001"
    
    payload = {
        "name": "Existence Test Product",
        "description": "test",
        "brand": "test",
        "price": 10.0,
        "quantity": 5,
        "category_id": non_existent_cat_id
    }
    
    # 1. Single product creation
    res = requests.post(f"{BASE_URL}/products/", json=payload)
    print(f"Single Creation: {res.status_code}")
    if res.status_code == 400:
        print(f"Error Message: {res.json().get('error')}")

    # 2. Bulk product creation
    csv_content = "name,description,brand,price,quantity,category_id\n"
    csv_content += f"Bulk Existence Test,Desc,Brand,100,10,{non_existent_cat_id}\n"
    
    files = {'file': ('test_existence.csv', csv_content)}
    res = requests.post(f"{BASE_URL}/products/bulk/", files=files)
    print(f"\nBulk Upload: {res.status_code}")
    result = res.json()
    for err in result.get('errors', []):
        print(f"  - Error: {err.get('error')}")

if __name__ == "__main__":
    test_category_existence_validation()
