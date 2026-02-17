from rest_framework.decorators import api_view, renderer_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.renderers import JSONRenderer

from greet.application.usecases import GreetUseCase

@api_view(["GET"])
@renderer_classes([JSONRenderer])   # ✅ force JSON only (no HTML template needed)
def greet_view(request):
    name = request.query_params.get("name")
    city = request.query_params.get("city")
    mood = request.query_params.get("mood")

    usecase = GreetUseCase()
    result = usecase.greet(name=name, city=city, mood=mood)

    return Response({"ok": True, "data": result}, status=status.HTTP_200_OK)
