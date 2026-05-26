from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_orders, name='get-orders'),
    path('create/', views.create_order, name='create-order'),
    path('verify-payment/', views.verify_payment, name='verify-payment'),

    # COD
    path('create-cod/', views.create_cod_order, name='create-cod-order'),
]