from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from rest_framework_simplejwt.tokens import RefreshToken


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):

    def get_login_redirect_url(self, request):

        print("🔥 CUSTOM ADAPTER RUNNING 🔥")

        user = request.user

        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)

        host = request.get_host()

        if "localhost" in host or "127.0.0.1" in host or "192.168" in host:
            base_url = "http://localhost:3000"
        else:
            base_url = "https://ecommerce-django-two.vercel.app"

        return f"{base_url}/login?access={access}&refresh={str(refresh)}"