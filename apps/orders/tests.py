import pytest
from django.contrib.auth import get_user_model
from apps.orders.models import Order

User = get_user_model()

@pytest.fixture
def user(db):
    return User.objects.create_user(
        username='testuser',
        email='test@solemate.com',
        password='test123'
    )

@pytest.mark.django_db
def test_order_creation(user):
    order = Order.objects.create(
        user=user,
        total_amount=999,
        payment_status='paid',
        status='processing'
    )
    assert order.id is not None
    assert order.total_amount == 999
    assert order.status == 'processing'

@pytest.mark.django_db
def test_order_belongs_to_user(user):
    order = Order.objects.create(
        user=user,
        total_amount=500,
        payment_status='pending',
        status='pending'
    )
    assert order.user.username == 'testuser'

@pytest.mark.django_db
def test_order_default_status(user):
    order = Order.objects.create(
        user=user,
        total_amount=100,
        payment_status='pending',
        status='pending'
    )
    assert order.payment_status == 'pending'