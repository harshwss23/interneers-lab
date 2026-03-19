import json
from django.http import JsonResponse, HttpResponseNotAllowed
from django.views.decorators.csrf import csrf_exempt
from pydantic import ValidationError as PydanticValidationError

from products.repositories.category_repository import ProductCategoryRepository
from products.services.category_service import ProductCategoryService, NotFoundError, ValidationError
from products.schemas.category_schemas import CategoryCreateRequest, CategoryUpdateRequest
from products.repositories.product_repository import ProductRepository
from products.services.product_service import ProductService

category_service = ProductCategoryService(ProductCategoryRepository())
# product_service will be used for category -> products list later
product_service = ProductService(ProductRepository())

def _json_body(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        return None

@csrf_exempt
def categories_collection(request):
    if request.method == "GET":
        items = category_service.list_categories()
        return JsonResponse({"data": [i.model_dump() for i in items]})

    if request.method == "POST":
        body = _json_body(request)
        if body is None:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        try:
            req = CategoryCreateRequest(**body)
            item = category_service.create_category(req)
            return JsonResponse({"data": item.model_dump()}, status=201)
        except PydanticValidationError as e:
            return JsonResponse({"error": "Validation error", "details": e.errors()}, status=400)
        except ValidationError as e:
            return JsonResponse({"error": str(e)}, status=400)

    return HttpResponseNotAllowed(["GET", "POST"])

@csrf_exempt
def category_item(request, category_id: str, product_id: str = None):
    if product_id:
        if request.method == "POST":
            try:
                category_service.add_product_to_category(category_id, product_id)
                return JsonResponse({"message": "Product added to category"})
            except (NotFoundError, ValidationError) as e:
                return JsonResponse({"error": str(e)}, status=404 if isinstance(e, NotFoundError) else 400)
        
        if request.method == "DELETE":
            try:
                category_service.remove_product_from_category(category_id, product_id)
                return JsonResponse({"message": "Product removed from category"})
            except (NotFoundError, ValidationError) as e:
                return JsonResponse({"error": str(e)}, status=404 if isinstance(e, NotFoundError) else 400)
        
        return HttpResponseNotAllowed(["POST", "DELETE"])

    if request.method == "GET":
        if request.path.endswith("/products/"):
            products = product_service.list_products_by_category(category_id)
            return JsonResponse({"data": [p.model_dump() for p in products]})
        
        try:
            item = category_service.get_category(category_id)
            return JsonResponse({"data": item.model_dump()})
        except NotFoundError as e:
            return JsonResponse({"error": str(e)}, status=404)

    if request.method in ["PATCH", "PUT"]:
        body = _json_body(request)
        if body is None:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        try:
            req = CategoryUpdateRequest(**body)
            item = category_service.update_category(category_id, req)
            return JsonResponse({"data": item.model_dump()})
        except PydanticValidationError as e:
            return JsonResponse({"error": "Validation error", "details": e.errors()}, status=400)
        except ValidationError as e:
            return JsonResponse({"error": str(e)}, status=400)
        except NotFoundError as e:
            return JsonResponse({"error": str(e)}, status=404)

    if request.method == "DELETE":
        try:
            category_service.delete_category(category_id)
            return JsonResponse({"message": "Deleted"})
        except NotFoundError as e:
            return JsonResponse({"error": str(e)}, status=404)

    return HttpResponseNotAllowed(["GET", "PATCH", "PUT", "DELETE"])
