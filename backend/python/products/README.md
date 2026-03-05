# Inventory Management System – Week 2

Basic Inventory Management APIs built using **Django** and **Django REST Framework (DRF)**.

⚠️ Data is stored in-memory (dictionary-based). Server restart will clear all products.

---

## 🚀 Tech Stack
- Python
- Django
- Django REST Framework
- Postman (API Testing)

---

## ⚙️ Setup

```bash
python -m venv venv
venv\Scripts\activate
pip install django djangorestframework
python manage.py runserver
```

Base URL:
```
http://127.0.0.1:8000/api-2/
```

---

## 📡 API Endpoints

### Create Product
POST `/api-2/products/`

```json
{
  "name": "Mouse",
  "description": "Wireless",
  "category": "electronics",
  "price": 799,
  "brand": "Logitech",
  "quantity": 10
}
```
![Create](screenshots/create.png)

### Get All Products
GET `/api-2/products/`

Pagination:
```
/api-2/products/?page=1&page_size=5
```
![List](screenshots/list.png)

### Get Single Product
GET `/api-2/products/<id>/`

![Single](screenshots/single.png)

### Update Product
PATCH `/api-2/products/<id>/`

```json
{
  "quantity": 25
}
```

![Update](screenshots/update.png)

### Delete Product
DELETE `/api-2/products/<id>/`

---
![Delete](screenshots/delete.png) 

### MongoDB Compass 
![MongoDB](screenshots/MongoDB_ss.png)

## 👨‍💻 Author
Harsh Shekhawat  
Week 2 – Inventory Management System