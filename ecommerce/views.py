from django.shortcuts import redirect
from rest_framework_simplejwt.tokens import RefreshToken
from allauth.socialaccount.models import SocialToken

def google_callback(request):
    user = request.user

    if not user.is_authenticated:
        return redirect("https://solemate01.vercel.app/login")

    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)
    refresh_token = str(refresh)

    return redirect(
    f"https://solemate01.vercel.app/login"
    f"?access={access}&refresh={refresh_token}"
)