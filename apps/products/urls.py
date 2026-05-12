from django.urls import path
from . import views

urlpatterns = [
    path('', views.product_list, name='product-list'),
    path('<int:pk>/', views.product_detail, name='product-detail'),
    path('ai-search/', views.ai_product_search, name='ai-product-search'),
]