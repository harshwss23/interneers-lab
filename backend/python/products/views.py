from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .store import PRODUCTS, new_id
from .serializers import ProductCreateSerializer, ProductUpdateSerializer


def not_found(product_id: str):
    return Response(
        {"error": {"code": "NOT_FOUND", "message": f"Product '{product_id}' not found"}},
        status=status.HTTP_404_NOT_FOUND,
    )


class ProductListCreate(APIView):
    """
    POST /api/products/   -> create
    GET  /api/products/   -> list (supports ?page=1&page_size=10)
    """

    def post(self, request):
        s = ProductCreateSerializer(data=request.data)
        if not s.is_valid():
            return Response(
                {"error": {"code": "VALIDATION_ERROR", "details": s.errors}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = s.validated_data
        pid = new_id()
        product = {"id": pid, **data}
        PRODUCTS[pid] = product

        return Response(product, status=status.HTTP_201_CREATED)

    def get(self, request):
        items = list(PRODUCTS.values())

        # basic pagination (advanced)
        try:
            page = int(request.query_params.get("page", "1"))
            page_size = int(request.query_params.get("page_size", "10"))
            if page < 1 or page_size < 1 or page_size > 100:
                raise ValueError()
        except ValueError:
            return Response(
                {"error": {"code": "INVALID_PAGINATION", "message": "Use page>=1 and 1<=page_size<=100"}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        start = (page - 1) * page_size
        end = start + page_size

        return Response(
            {
                "page": page,
                "page_size": page_size,
                "total": len(items),
                "results": items[start:end],
            },
            status=status.HTTP_200_OK,
        )


class ProductDetail(APIView):
    """
    GET    /api/products/<id>/  -> fetch
    PUT    /api/products/<id>/  -> replace
    PATCH  /api/products/<id>/  -> partial update
    DELETE /api/products/<id>/  -> delete
    """

    def get(self, request, product_id: str):
        p = PRODUCTS.get(product_id)
        if not p:
            return not_found(product_id)
        return Response(p)

    def delete(self, request, product_id: str):
        if product_id not in PRODUCTS:
            return not_found(product_id)
        del PRODUCTS[product_id]
        return Response(status=status.HTTP_204_NO_CONTENT)

    def put(self, request, product_id: str):
        # full replace => same validation as create
        if product_id not in PRODUCTS:
            return not_found(product_id)

        s = ProductCreateSerializer(data=request.data)
        if not s.is_valid():
            return Response(
                {"error": {"code": "VALIDATION_ERROR", "details": s.errors}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        PRODUCTS[product_id] = {"id": product_id, **s.validated_data}
        return Response(PRODUCTS[product_id])

    def patch(self, request, product_id: str):
        if product_id not in PRODUCTS:
            return not_found(product_id)

        s = ProductUpdateSerializer(data=request.data, partial=True)
        if not s.is_valid():
            return Response(
                {"error": {"code": "VALIDATION_ERROR", "details": s.errors}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        PRODUCTS[product_id].update(s.validated_data)
        return Response(PRODUCTS[product_id])