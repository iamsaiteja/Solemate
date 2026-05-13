from django.shortcuts import redirect
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

def google_callback(request):
    user = request.user

    # User logged in kaalekapothe → login ki back
    if not user.is_authenticated:
        return redirect("https://solemate01.vercel.app/login?error=failed")

    # Real JWT tokens generate cheyyali ← idi missing undi meeru dggara
    refresh = RefreshToken.for_user(user)
    access  = str(refresh.access_token)
    refresh_token = str(refresh)

    # Tokens tho frontend ki redirect
    return redirect(
        f"https://solemate01.vercel.app/login"
        f"?access={access}&refresh={refresh_token}"
    )