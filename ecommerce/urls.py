from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
from .views import google_callback   


def home(request):
    return HttpResponse("Backend is running")


urlpatterns = [
    path('admin/', admin.site.urls),

    path('', home),

    path('api/auth/', include('apps.api.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/cart/', include('apps.cart.urls')),
    path('api/orders/', include('apps.orders.urls')),

    # GOOGLE AUTH
    path('accounts/', include('allauth.urls')),
    path('users/auth/google/callback/', google_callback, name='google_callback'),
    

]
urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT
)