from datetime import datetime
from typing import Optional, Tuple
from django.http import JsonResponse
from accounts.db.token_document import AuthTokenDocument
from accounts.db.user_document import UserDocument

def _get_bearer_token(request) -> Optional[str]:
    auth = request.headers.get("Authorization") or request.META.get("HTTP_AUTHORIZATION")
    if not auth or not auth.startswith("Bearer "):
        return None
    return auth.split(" ", 1)[1].strip()

def require_auth(request) -> Tuple[Optional[UserDocument], Optional[JsonResponse]]:
    """
    Returns (user, error_response). If error_response is not None, return it from controller.
    """
    token = _get_bearer_token(request)
    if not token:
        return None, JsonResponse({"error": "AUTH_REQUIRED"}, status=401)

    token_doc = AuthTokenDocument.objects(token=token).first()
    if not token_doc:
        return None, JsonResponse({"error": "INVALID_TOKEN"}, status=401)

    if datetime.now(timezone.utc) > token_doc.expires_at:
        return None, JsonResponse({"error": "TOKEN_EXPIRED"}, status=401)

    user = UserDocument.objects(id=token_doc.user_id).first()
    if not user:
        return None, JsonResponse({"error": "USER_NOT_FOUND"}, status=401)

    if user.status != "ACTIVE":
        return None, JsonResponse({"error": "USER_INACTIVE"}, status=403)

    return user, None

def require_role(user: UserDocument, allowed_roles: list[str]) -> Optional[JsonResponse]:
    if user.role not in allowed_roles:
        return JsonResponse({"error": "FORBIDDEN"}, status=403)
    return None