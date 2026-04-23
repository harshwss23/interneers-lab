from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q
from .models import Product
from .serializers import ProductSerializer
import csv
import io

class ProductListCreate(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response({"data": serializer.data}, status=status.HTTP_201_CREATED)
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        queryset = Product.objects.all()
        
        category = request.query_params.get('category')
        category_id = request.query_params.get('category_id') # Support frontend's category_id param
        search = request.query_params.get('search')
        created_by = request.query_params.get('created_by')

        if category:
            queryset = queryset.filter(category=category.lower())
        elif category_id:
            # Simple mapping if needed, or just filter by category field
            queryset = queryset.filter(category=category_id.lower())
        
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search) |
                Q(brand__icontains=search)
            )

        if created_by:
            queryset = queryset.filter(created_by__username=created_by)

        # Basic pagination
        try:
            page = int(request.query_params.get("page", "1"))
            page_size = int(request.query_params.get("page_size", "10"))
        except ValueError:
            page, page_size = 1, 10

        start = (page - 1) * page_size
        end = start + page_size
        
        results = queryset.order_by('-created_at')[start:end]
        serializer = ProductSerializer(results, many=True)

        return Response({
            "data": serializer.data,
            "page": page,
            "page_size": page_size,
            "total": queryset.count()
        })

class ProductDetail(APIView):
    def get_permissions(self):
        if self.request.method in ['PATCH', 'PUT', 'DELETE']:
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_object(self, pk):
        try:
            # Handle both string UUIDs (from old Mongo structure) and integer PKs
            if isinstance(pk, str) and not pk.isdigit():
                return None # Or search by a 'uuid' field if we had one
            return Product.objects.get(pk=pk)
        except (Product.DoesNotExist, ValueError):
            return None

    def get(self, request, pk):
        product = self.get_object(pk)
        if not product:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProductSerializer(product)
        return Response({"data": serializer.data})

    def patch(self, request, pk):
        product = self.get_object(pk)
        if not product:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if product.created_by != request.user and request.user.role != "ADMIN":
            return Response({"error": "Only the owner or an admin can modify this product."}, status=status.HTTP_403_FORBIDDEN)

        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"data": serializer.data})
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        product = self.get_object(pk)
        if not product:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if product.created_by != request.user and request.user.role != "ADMIN":
            return Response({"error": "Only the owner or an admin can delete this product."}, status=status.HTTP_403_FORBIDDEN)

        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class BulkUploadProducts(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        if 'file' not in request.FILES:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        file = request.FILES['file']
        decoded_file = file.read().decode('utf-8')
        io_string = io.StringIO(decoded_file)
        reader = csv.DictReader(io_string)
        
        created_count = 0
        errors = []
        
        for i, row in enumerate(reader):
            try:
                data = {
                    "name": row.get("name"),
                    "description": row.get("description", ""),
                    "brand": row.get("brand", ""),
                    "category": row.get("category", "other"),
                    "price": float(row.get("price", 0)),
                    "quantity": int(row.get("quantity", 0))
                }
                serializer = ProductSerializer(data=data)
                if serializer.is_valid():
                    serializer.save(created_by=request.user)
                    created_count += 1
                else:
                    errors.append({"row": i, "errors": serializer.errors})
            except Exception as e:
                errors.append({"row": i, "error": str(e)})
        
        return Response({
            "message": f"Successfully created {created_count} products",
            "errors": errors
        }, status=status.HTTP_201_CREATED if not errors else status.HTTP_207_MULTI_STATUS)