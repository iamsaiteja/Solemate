from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_wishlist, name='get-wishlist'),
    path('toggle/', views.toggle_wishlist, name='toggle-wishlist'),
    path('ids/', views.wishlist_ids, name='wishlist-ids'),
]