from django.shortcuts import redirect
from rest_framework_simplejwt.tokens import RefreshToken
from allauth.socialaccount.models import SocialToken

from django.core.mail import send_mail
from django.http import HttpResponse
from django.conf import settings


def send_test_email(request):

    send_mail(
        subject='SoleMate Test Email',
        message='Email system working successfully 😍',
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=['tejayadav872@gmail.com'],
        fail_silently=False,
    )

    return HttpResponse("Email sent successfully")

def google_callback(request):

   
    user = request.user

    if not user.is_authenticated:
        return redirect("https://ecommerce-django-two.vercel.app/login")

    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)
    refresh_token = str(refresh)

    return redirect(
        f"https://ecommerce-django-two.vercel.app/login"
        f"?access={access}&refresh={refresh_token}"
    )