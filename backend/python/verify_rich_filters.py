import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_rich_filters():
    print("--- Testing Rich Product Filters ---")
    
    # 1. Search filter
    res = requests.get(f"{BASE_URL}/products/?search=Mouse")
    data = res.json().get("data", [])
    print(f"Search 'Mouse': Found {len(data)} items")
    for item in data:
        print(f"  - {item['name']} ({item['brand']})")

    # 2. Price filter (min_price=100, max_price=600)
    res = requests.get(f"{BASE_URL}/products/?min_price=100&max_price=600")
    data = res.json().get("data", [])
    print(f"\nPrice 100-600: Found {len(data)} items")
    for item in data:
        print(f"  - {item['name']} (${item['price']})")

    # 3. Category list filter
    cats = requests.get(f"{BASE_URL}/categories/").json().get("data", [])
    electronics = next((c['id'] for c in cats if c['title'] == 'Electronics'), None)
    furniture = next((c['id'] for c in cats if c['title'] == 'Furniture'), None)
    
    if electronics and furniture:
        url = f"{BASE_URL}/products/?category_id={electronics}&category_id={furniture}"
        res = requests.get(url)
        data = res.json().get("data", [])
        print(f"\nCategories (Electronics+Furniture): Found {len(data)} items")
        for item in data:
            print(f"  - {item['name']} (Category: {item['category_id']})")

if __name__ == "__main__":
    test_rich_filters()
