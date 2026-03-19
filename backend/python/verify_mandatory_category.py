import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_mandatory_fields():
    print("--- Testing Mandatory Category Fields ---")
    
    # 1. Missing description
    payload1 = {"title": "Missing Desc"}
    res = requests.post(f"{BASE_URL}/categories/", json=payload1)
    print(f"Post with missing desc: {res.status_code}")
    if res.status_code == 400:
        print(f"Error Message: {res.json().get('error')}")

    # 2. Missing title
    payload2 = {"description": "Missing Title"}
    res = requests.post(f"{BASE_URL}/categories/", json=payload2)
    print(f"Post with missing title: {res.status_code}")
    if res.status_code == 400:
        print(f"Error Message: {res.json().get('error')}")

    # 3. Empty strings
    payload3 = {"title": "Valid", "description": ""}
    res = requests.post(f"{BASE_URL}/categories/", json=payload3)
    print(f"Post with empty desc: {res.status_code}")
    if res.status_code == 400:
        print(f"Error Message: {res.json().get('error')}")

if __name__ == "__main__":
    test_mandatory_fields()
