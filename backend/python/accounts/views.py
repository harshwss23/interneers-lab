from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from .models import User
from .permissions import IsAdmin

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        role = data.get('role', 'WAREHOUSE_MANAGER')

        if not username or not password:
            return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, password=password, email=email, role=role)
        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'role': user.role,
                'status': user.status
            }
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        if user.status == 'INACTIVE':
            return Response({'error': 'User account is inactive. Please contact admin.'}, status=status.HTTP_403_FORBIDDEN)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'role': user.role,
                'status': user.status
            }
        })

class UserListView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        users = User.objects.all()
        return Response({
            "data": [{
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "role": u.role,
                "status": u.status,
                "date_joined": u.date_joined
            } for u in users]
        })

class UserUpdateView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            data = request.data
            if 'role' in data:
                user.role = data['role']
            if 'status' in data:
                user.status = data['status']
            user.save()
            return Response({"data": {"id": user.id, "role": user.role, "status": user.status}})
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
