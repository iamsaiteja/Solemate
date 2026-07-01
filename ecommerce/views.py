import os
import urllib.parse
import requests
from django.shortcuts import redirect
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.http import HttpResponse
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

# frontend lo hardcode chesina client_id tho EXACT same undali
GOOGLE_CLIENT_ID = "746873785598-pihaf619h7icclsb01vrvv093ik5momp.apps.googleusercontent.com"


def send_test_email(request):
    send_mail(
        subject='SoleMate Test Email',
        message='Email system working successfully 😍',
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=['tejayadav872@gmail.com'],
        fail_silently=False,
    )
    return HttpResponse("Email sent successfully")


# ====== GOOGLE LOGIN (session avasaram ledu — anni devices lo work avtundi) ======
def google_callback(request):
    frontend = "https://ecommerce-django-two.vercel.app"
    redirect_uri = "https://solemate.servecounterstrike.com/users/auth/google/callback/"

    code = request.GET.get('code')
    if not code:
        return redirect(f"{frontend}/login?error=no_code")

    # 1) code ni token ki exchange chey
    token_resp = requests.post('https://oauth2.googleapis.com/token', data={
        'code': code,
        'client_id': GOOGLE_CLIENT_ID,
        'client_secret': os.environ.get('GOOGLE_CLIENT_SECRET'),
        'redirect_uri': redirect_uri,
        'grant_type': 'authorization_code',
    }, timeout=10)

    if token_resp.status_code != 200:
        # asalu google error em ichindo URL lo chupinchu (debug kosam)
        detail = urllib.parse.quote(token_resp.text[:180])
        return redirect(f"{frontend}/login?error=token&detail={detail}")

    google_access = token_resp.json().get('access_token')

    # 2) user email + peru techuko
    info_resp = requests.get(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        headers={'Authorization': f'Bearer {google_access}'},
        timeout=10,
    )
    if info_resp.status_code != 200:
        return redirect(f"{frontend}/login?error=userinfo")

    info = info_resp.json()
    email = info.get('email')
    if not email:
        return redirect(f"{frontend}/login?error=email")

    # 3) user get or create
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
            first_name=info.get('given_name', ''),
            last_name=info.get('family_name', ''),
        )

    try:
        from apps.users.models import UserProfile
        UserProfile.objects.get_or_create(user=user)
    except Exception:
        pass

    # 4) JWT tokens tho frontend ki pampu
    refresh = RefreshToken.for_user(user)
    return redirect(f"{frontend}/login?access={str(refresh.access_token)}&refresh={str(refresh)}")