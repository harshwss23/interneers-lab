import json
from django.http import JsonResponse, HttpResponseNotAllowed
from django.views.decorators.csrf import csrf_exempt
from pydantic import ValidationError as PydanticValidationError

from accounts.schemas.auth_schemas import RegisterRequest, VerifyOtpRequest, LoginRequest
from accounts.repositories.user_repository import UserRepository
from accounts.repositories.token_repository import TokenRepository
from accounts.services.auth_service import AuthService, AuthError

service = AuthService(UserRepository(), TokenRepository())

def _json_body(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        return None

@csrf_exempt
def register(request):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    body = _json_body(request)
    if body is None:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    try:
        req = RegisterRequest(**body)
        data = service.register(req.name, req.email, req.password, req.role)
        return JsonResponse({"data": data}, status=201)
    except PydanticValidationError as e:
        return JsonResponse({"error": "Validation error", "details": e.errors()}, status=400)
    except AuthError as e:
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def verify_otp(request):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    body = _json_body(request)
    if body is None:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    try:
        req = VerifyOtpRequest(**body)
        data = service.verify_otp(req.email, req.otp)
        return JsonResponse({"data": data})
    except PydanticValidationError as e:
        return JsonResponse({"error": "Validation error", "details": e.errors()}, status=400)
    except AuthError as e:
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def login(request):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    body = _json_body(request)
    if body is None:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    try:
        req = LoginRequest(**body)
        data = service.login(req.email, req.password)
        return JsonResponse({"data": data})
    except PydanticValidationError as e:
        return JsonResponse({"error": "Validation error", "details": e.errors()}, status=400)
    except AuthError as e:
        return JsonResponse({"error": str(e)}, status=400)