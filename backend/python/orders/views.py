from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.http import JsonResponse
from .db.order_document import OrderDocument
from products.db.product_document import ProductDocument
from bson import ObjectId

class OrderListCreateView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'ADMIN':
            orders = OrderDocument.objects.all().order_by('-created_at')
        elif user.role == 'WAREHOUSE_MANAGER':
            # Managers see orders for products they created
            # We need to find products owned by this manager first
            my_products = ProductDocument.objects(created_by=user.username)
            orders = OrderDocument.objects(product_id__in=my_products).order_by('-created_at')
        else:
            # Users see their own orders
            orders = OrderDocument.objects(username=user.username).order_by('-created_at')
        
        data = []
        for o in orders:
            order_dict = {
                "id": str(o.id),
                "product": str(o.product_id.id) if o.product_id else None,
                "product_name": o.product_id.name if o.product_id else "Unknown Product",
                "username": o.username,
                "quantity": o.quantity,
                "address": o.address,
                "payment_details": o.payment_details,
                "status": o.status,
                "created_at": o.created_at.isoformat()
            }
            data.append(order_dict)
        
        return Response(data)

    def post(self, request):
        data = request.data
        try:
            product = ProductDocument.objects.get(id=ObjectId(data['product']))
            order_quantity = int(data['quantity'])
            
            # 1. Stock Validation
            if (product.quantity or 0) < order_quantity:
                return Response(
                    {"detail": f"Insufficient stock. Only {product.quantity} units available."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # 2. Create Order
            order = OrderDocument(
                product_id=product,
                username=request.user.username,
                quantity=order_quantity,
                address=data['address'],
                payment_details=data['payment_details']
            )
            order.save()
            
            # 3. Auto-Decrement Stock
            product.quantity = (product.quantity or 0) - order_quantity
            product.save()
            
            return Response({"message": "Order placed and stock updated", "id": str(order.id)}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class OrderApproveView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            order = OrderDocument.objects.get(id=ObjectId(pk))
        except Exception:
            return Response({"detail": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        # Product owner or admin can approve
        if user.role == 'ADMIN' or order.product_id.created_by == user.username:
            order.status = 'APPROVED'
            order.save()
            return Response({"message": "Order approved", "status": order.status})
        
        return Response({"detail": "Not authorized to approve this order."}, status=status.HTTP_403_FORBIDDEN)
