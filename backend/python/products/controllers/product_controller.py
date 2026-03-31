import json
from django.http import JsonResponse, HttpResponseNotAllowed
from django.views.decorators.csrf import csrf_exempt

from pydantic import ValidationError as PydanticValidationError

from products.repositories.product_repository import ProductRepository
from products.services.product_service import ProductService, NotFoundError, ValidationError
from products.schemas.product_schemas import ProductCreateRequest, ProductUpdateRequest

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny

service = ProductService(ProductRepository())

def _json_body(request):
    if hasattr(request, "data"):
        return request.data
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        return None

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@csrf_exempt
def products_collection(request):
    if request.path.endswith("/ensure-categories/"):
        if request.method == "POST":
            count = service.ensure_all_products_have_category()
            return JsonResponse({"message": f"Updated {count} products with General category"})
        return HttpResponseNotAllowed(["POST"])

    if request.method == "GET":
        filters = {}
        category_ids = request.GET.getlist("category_id")
        if category_ids:
            filters["category_ids"] = category_ids
        
        brands = request.GET.getlist("brand")
        if brands:
            filters["brands"] = brands
        
        min_price = request.GET.get("min_price")
        if min_price:
            filters["min_price"] = min_price
        
        max_price = request.GET.get("max_price")
        if max_price:
            filters["max_price"] = max_price
            
        created_by = request.GET.get("created_by")
        if created_by:
            filters["created_by"] = created_by

        search = request.GET.get("search")
        if search:
            filters["search"] = search

        try:
            items = service.list_products(filters if filters else None)
            return JsonResponse({"data": [i.model_dump() for i in items]})
        except ValidationError as e:
            return JsonResponse({"error": str(e)}, status=400)

    if request.method == "POST":
        body = _json_body(request)
        if body is None:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        try:
            req = ProductCreateRequest(**body)
            # Automatically set created_by from authenticated user
            req.created_by = request.user.username
            item = service.create_product(req)
            return JsonResponse({"data": item.model_dump()}, status=201)
        except PydanticValidationError as e:
            return JsonResponse({"error": "Validation error", "details": e.errors()}, status=400)
        except ValidationError as e:
            return JsonResponse({"error": str(e)}, status=400)

    return HttpResponseNotAllowed(["GET", "POST"])


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@csrf_exempt
def bulk_upload_products(request):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    
    import csv
    import io
    
    if "file" not in request.FILES:
        return JsonResponse({"error": "No file provided"}, status=400)
    
    file = request.FILES["file"]
    decoded_file = file.read().decode("utf-8")
    io_string = io.StringIO(decoded_file)
    reader = csv.DictReader(io_string)
    
    products_to_create = []
    for row in reader:
        try:
            # Map CSV columns to Product properties
            # Expecting: name, description, brand, category_id, price, quantity
            products_to_create.append({
                "name": row["name"],
                "description": row.get("description", ""),
                "brand": row.get("brand", "Unknown"),
                "category_id": row.get("category_id"),
                "price": float(row["price"]),
                "quantity": int(row["quantity"]),
                "created_by": request.user.username
            })
        except (KeyError, ValueError) as e:
            return JsonResponse({"error": f"Invalid CSV format or data: {str(e)}"}, status=400)
    
    result = service.create_products_bulk(products_to_create)
    return JsonResponse({
        "data": [i.model_dump() for i in result["created"]],
        "errors": result["errors"]
    }, status=201 if not result["errors"] else 207)

@api_view(["GET", "PATCH", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
@csrf_exempt
def product_item(request, product_id: str):
    try:
        try:
            item = service.get_product(product_id)
        except NotFoundError as e:
            return JsonResponse({"error": str(e)}, status=404)

        # Ownership / Admin Check
        is_owner = item.created_by == request.user.username
        is_admin = getattr(request.user, "role", "") == "ADMIN"

        if request.method == "GET":
            return JsonResponse({"data": item.model_dump()})

        # Multi-level restriction: Only poster or Admin can Edit/Delete
        if not is_owner and not is_admin:
            return JsonResponse({
                "error": "Access Denied: Only the manager who posted this product or an Administrator can modify it."
            }, status=403)

        if request.method in ["PATCH", "PUT"]:
            body = _json_body(request)
            if body is None:
                return JsonResponse({"error": "Invalid JSON"}, status=400)
            try:
                req = ProductUpdateRequest(**body)
                updated_item = service.update_product(product_id, req)
                return JsonResponse({"data": updated_item.model_dump()})
            except PydanticValidationError as e:
                return JsonResponse({"error": str(e), "details": e.errors()}, status=400)
            except ValidationError as e:
                return JsonResponse({"error": str(e)}, status=400)
            except NotFoundError as e:
                return JsonResponse({"error": str(e)}, status=404)

        if request.method == "DELETE":
            try:
                service.delete_product(product_id)
                return JsonResponse({"message": "Deleted"})
            except NotFoundError as e:
                return JsonResponse({"error": str(e)}, status=404)

        return HttpResponseNotAllowed(["GET", "PATCH", "PUT", "DELETE"])
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return JsonResponse({"error": f"Internal Server Error: {str(e)}"}, status=500)