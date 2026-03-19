import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_refined_duplicate_check():
    print("--- Testing Refined Duplicate Product Check ---")
    base_name = "Refined Product " + str(json.loads(requests.get(f"{BASE_URL}/products/").text).get("data", []).__len__())
    
    p1 = {
        "name": base_name,
        "description": "Desc 1",
        "brand": "Brand 1",
        "price": 10.0,
        "quantity": 5
    }
    
    # 1. Create first product
    res = requests.post(f"{BASE_URL}/products/", json=p1)
    print(f"First Creation (P1): {res.status_code}")
    
    # 2. Create second product with SAME name but DIFFERENT description
    p2 = p1.copy()
    p2["description"] = "Desc 2"
    res = requests.post(f"{BASE_URL}/products/", json=p2)
    print(f"Second Creation (P2 - different desc): {res.status_code}")
    
    # 3. Create third product with SAME name, desc but DIFFERENT brand
    p3 = p1.copy()
    p3["brand"] = "Brand 2"
    res = requests.post(f"{BASE_URL}/products/", json=p3)
    print(f"Third Creation (P3 - different brand): {res.status_code}")
    
    # 4. Try to create EXACT duplicate of P1
    res = requests.post(f"{BASE_URL}/products/", json=p1)
    print(f"Fourth Creation (Duplicate of P1): {res.status_code}")
    if res.status_code == 400:
        print(f"Error Message: {res.json().get('error')}")

if __name__ == "__main__":
    test_refined_duplicate_check()
