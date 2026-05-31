from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import redirect
from django_ratelimit.decorators import ratelimit


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get('username')
    email = request.data.get('email', '')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')

    if not username or not password:
        return Response({'error': 'Username and password required'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already taken'}, status=400)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
    )
    tokens = get_tokens_for_user(user)
    return Response({
        'message': 'Registration successful!',
        'user': {'id': user.id, 'username': user.username, 'email': user.email},
        **tokens
    }, status=201)


@api_view(['POST'])
@permission_classes([AllowAny])
@ratelimit(key='ip', rate='5/m', method='POST', block=True)
def login(request):
    from django.contrib.auth import authenticate
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        tokens = get_tokens_for_user(user)
        return Response({
            'message': 'Login successful!',
            'user': {'id': user.id, 'username': user.username, 'email': user.email},
            **tokens
        })
    return Response({'error': 'Invalid credentials'}, status=401)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
    })


def google_login_callback(request):
    user = request.user
    if user.is_authenticated:
        tokens = get_tokens_for_user(user)
        frontend_url = "https://ecommerce-django-two.vercel.app/login"
        return redirect(f"{frontend_url}?access={tokens['access']}&refresh={tokens['refresh']}")
    return redirect("https://ecommerce-django-two.vercel.app/login")