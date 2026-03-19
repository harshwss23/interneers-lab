import json
from django.http import JsonResponse, HttpResponseNotAllowed
from django.views.decorators.csrf import csrf_exempt
from pydantic import ValidationError as PydanticValidationError

from accounts.utils.auth_guard import require_auth, require_role
from products.schemas.product_schemas import ProductCreateRequest
from products.repositories.product_repository import ProductRepository
from products.services.product_service import ProductService

service = ProductService(ProductRepository())

def _json_body(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        return None

@csrf_exempt
def create_product(request):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    # ✅ Auth
    user, err = require_auth(request)
    if err:
        return err

    # ✅ Only MANAGER can create product
    role_err = require_role(user, ["MANAGER"])
    if role_err:
        return role_err

    body = _json_body(request)
    if body is None:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    try:
        req = ProductCreateRequest(**body)
        created = service.create_product(req, created_by_user_id=str(user.id))
        return JsonResponse({"data": created}, status=201)
    except PydanticValidationError as e:
        return JsonResponse({"error": "Validation error", "details": e.errors()}, status=400)