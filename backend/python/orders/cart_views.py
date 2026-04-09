from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .db.cart_document import CartDocument, CartItem
from products.db.product_document import ProductDocument
from bson import ObjectId

class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_cart(self, username):
        cart = CartDocument.objects(username=username).first()
        if not cart:
            cart = CartDocument(username=username, items=[])
            cart.save()
        return cart

    def get(self, request):
        cart = self.get_cart(request.user.username)
        data = []
        for item in cart.items:
            # Check if product still exists
            try:
                prod = item.product_id
                if prod:
                    data.append({
                        "product_id": str(prod.id),
                        "product_name": prod.name,
                        "price": prod.price,
                        "quantity": item.quantity,
                        "available_quantity": prod.quantity
                    })
            except Exception:
                # Reference might be broken
                continue
        return Response({"items": data})

    def post(self, request):
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        
        if not product_id:
            return Response({"detail": "product_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = ProductDocument.objects.get(id=ObjectId(product_id))
        except Exception as e:
            return Response({"detail": f"Product not found: {str(e)}"}, status=status.HTTP_404_NOT_FOUND)

        cart = self.get_cart(request.user.username)
        
        # Check if item already in cart
        found = False
        for item in cart.items:
            if str(item.product_id.id) == product_id:
                item.quantity += quantity
                found = True
                break
        
        if not found:
            cart.items.append(CartItem(product_id=product, quantity=quantity))
        
        cart.save()
        return Response({"message": "Added to cart"})

    def patch(self, request):
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity'))

        cart = self.get_cart(request.user.username)
        new_items = []
        for item in cart.items:
            if str(item.product_id.id) == product_id:
                if quantity > 0:
                    item.quantity = quantity
                    new_items.append(item)
            else:
                new_items.append(item)
        
        cart.items = new_items
        cart.save()
        return Response({"message": "Cart updated"})

    def delete(self, request):
        # Clear cart
        cart = self.get_cart(request.user.username)
        cart.items = []
        cart.save()
        return Response({"message": "Cart cleared"})
