from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.shortcuts import redirect
from rest_framework_simplejwt.tokens import RefreshToken


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):

    def get_login_redirect_url(self, request):

        print("🔥 CUSTOM ADAPTER RUNNING 🔥")

        user = request.user

        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)

        return (
            f"https://solemate01.vercel.app/login"
            f"?access={access}&refresh={str(refresh)}"
        )