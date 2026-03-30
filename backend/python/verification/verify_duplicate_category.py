import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_duplicate_category_check():
    print("--- Testing Duplicate Category Check ---")
    title = "Duplicate Category Test"
    payload = {"title": title, "description": "First time"}
    
    # Pre-cleanup
    res = requests.get(f"{BASE_URL}/categories/")
    for c in res.json().get("data", []):
        if c.get("title") == title:
            requests.delete(f"{BASE_URL}/categories/{c.get('id')}/")

    # 1. Create first time
    res = requests.post(f"{BASE_URL}/categories/", json=payload)
    print(f"First Creation: {res.status_code}")
    
    # 2. Try to create again
    res = requests.post(f"{BASE_URL}/categories/", json=payload)
    print(f"Second Creation (Duplicate): {res.status_code}")
    if res.status_code == 400:
        print(f"Error Message: {res.json().get('error')}")

if __name__ == "__main__":
    test_duplicate_category_check()
