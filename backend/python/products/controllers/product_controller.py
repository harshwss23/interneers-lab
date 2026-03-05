import json
from django.http import JsonResponse, HttpResponseNotAllowed
from django.views.decorators.csrf import csrf_exempt

from pydantic import ValidationError as PydanticValidationError

from products.repositories.product_repository import ProductRepository
from products.services.product_service import ProductService, NotFoundError, ValidationError
from products.schemas.product_schemas import ProductCreateRequest, ProductUpdateRequest

service = ProductService(ProductRepository())

def _json_body(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        return None

@csrf_exempt
def products_collection(request):
    if request.method == "GET":
        items = service.list_products()
        return JsonResponse({"data": [i.model_dump() for i in items]})

    if request.method == "POST":
        body = _json_body(request)
        if body is None:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        try:
            req = ProductCreateRequest(**body)
            item = service.create_product(req)
            return JsonResponse({"data": item.model_dump()}, status=201)
        except PydanticValidationError as e:
            return JsonResponse({"error": "Validation error", "details": e.errors()}, status=400)

    return HttpResponseNotAllowed(["GET", "POST"])


@csrf_exempt
def product_item(request, product_id: str):
    if request.method == "GET":
        try:
            item = service.get_product(product_id)
            return JsonResponse({"data": item.model_dump()})
        except NotFoundError as e:
            return JsonResponse({"error": str(e)}, status=404)

    if request.method in ["PATCH", "PUT"]:
        body = _json_body(request)
        if body is None:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        try:
            req = ProductUpdateRequest(**body)
            item = service.update_product(product_id, req)
            return JsonResponse({"data": item.model_dump()})
        except PydanticValidationError as e:
            return JsonResponse({"error": "Validation error", "details": e.errors()}, status=400)
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