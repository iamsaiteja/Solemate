import os
import requests
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.conf import settings
from django.views.generic import CreateView, UpdateView
from django.urls import reverse_lazy
from .forms import RegisterForm, LoginForm, AddressForm
from .models import User, Address
from apps.orders.models import Order
from allauth.socialaccount.models import SocialAccount
from rest_framework_simplejwt.tokens import RefreshToken


def register_view(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Account created successfully!')
            if user.role == 'seller':
                return redirect('seller_setup')
            return redirect('home')
    else:
        form = RegisterForm()
    return render(request, 'users/register.html', {'form': form})


def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(request, f'Welcome back, {user.username}!')
            return redirect(request.GET.get('next', 'home'))
    else:
        form = LoginForm()
    return render(request, 'users/login.html', {'form': form})


def logout_view(request):
    logout(request)
    messages.info(request, 'Logged out successfully.')
    return redirect('home')


@login_required
def profile_view(request):
    orders = Order.objects.filter(user=request.user).order_by('-created_at')[:5]
    addresses = request.user.addresses.all()
    return render(request, 'users/profile.html', {'orders': orders, 'addresses': addresses})


@login_required
def add_address(request):
    if request.method == 'POST':
        form = AddressForm(request.POST)
        if form.is_valid():
            address = form.save(commit=False)
            address.user = request.user
            if address.is_default:
                request.user.addresses.update(is_default=False)
            address.save()
            messages.success(request, 'Address added!')
            return redirect('profile')
    else:
        form = AddressForm()
    return render(request, 'users/address_form.html', {'form': form})


# ============ GOOGLE LOGIN (session avasaram ledu — anni devices lo work avtundi) ============
def google_callback(request):
    frontend_url = settings.FRONTEND_URL  # vercel frontend
    redirect_uri = "https://solemate.servecounterstrike.com/users/auth/google/callback/"

    code = request.GET.get('code')
    if not code:
        return redirect(f"{frontend_url}/login?error=no_code")

    # 1) Google nundi vachina code ni token ki exchange chey
    token_resp = requests.post('https://oauth2.googleapis.com/token', data={
        'code': code,
        'client_id': os.environ.get('GOOGLE_CLIENT_ID'),
        'client_secret': os.environ.get('GOOGLE_CLIENT_SECRET'),
        'redirect_uri': redirect_uri,
        'grant_type': 'authorization_code',
    }, timeout=10)

    if token_resp.status_code != 200:
        return redirect(f"{frontend_url}/login?error=token")

    google_access = token_resp.json().get('access_token')

    # 2) aa token tho user email + peru techuko
    info_resp = requests.get(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        headers={'Authorization': f'Bearer {google_access}'},
        timeout=10,
    )
    if info_resp.status_code != 200:
        return redirect(f"{frontend_url}/login?error=userinfo")

    info = info_resp.json()
    email = info.get('email')
    if not email:
        return redirect(f"{frontend_url}/login?error=email")

    first_name = info.get('given_name', '')
    last_name = info.get('family_name', '')

    # 3) user already unda? lekapothe kotha ga create chey
    user = User.objects.filter(email=email).first()
    if not user:
        base = email.split('@')[0]
        username = base
        i = 1
        while User.objects.filter(username=username).exists():
            username = f"{base}{i}"
            i += 1
        user = User.objects.create(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
        )

    # 4) JWT tokens mint chesi, frontend ki tokens tho pampu
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    return redirect(f"{frontend_url}/login?access={access_token}&refresh={refresh_token}")