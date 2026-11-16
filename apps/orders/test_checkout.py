from unittest.mock import MagicMock, patch
import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from apps.products.models import Product
from apps.cart.models import Cart, CartItem
from .models import Order

pytestmark = pytest.mark.django_db

@pytest.fixture
def setup():
    user = User.objects.create_user('buyer', password='test-password')
    product = Product.objects.create(name='Shoe', slug='shoe', price=100, stock=5)
    cart = Cart.objects.create(user=user)
    CartItem.objects.create(cart=cart, product=product, quantity=2)
    client = APIClient(); client.force_authenticate(user)
    data = {'shipping_address': 'Test address', 'phone': '9999999999', 'payment_method': 'card'}
    return client, user, product, cart, data


def create(client, data, path='create-cod', key='checkout-test-key-0001'):
    return client.post(f'/api/orders/{path}/', data, format='json', HTTP_IDEMPOTENCY_KEY=key)


def test_cod_uses_server_total_and_does_not_grant_card_discount(setup):
    client, user, product, cart, data = setup
    data['total_amount'] = '1'
    response = create(client, data)
    assert response.status_code == 201, response.data
    assert Order.objects.get().total_amount == 200
    product.refresh_from_db(); assert product.stock == 3
    assert cart.items.count() == 0
    assert create(client, data).status_code == 200
    assert Order.objects.count() == 1
    product.refresh_from_db(); assert product.stock == 3


def test_out_of_stock_keeps_cart_and_creates_no_order(setup):
    client, user, product, cart, data = setup
    product.stock = 1; product.save()
    assert create(client, data).status_code == 400
    assert Order.objects.count() == 0 and cart.items.count() == 1


def test_gateway_failure_rolls_back_and_preserves_cart(setup):
    client, user, product, cart, data = setup
    with patch('apps.orders.views.payment_client', side_effect=RuntimeError('private detail')):
        response = create(client, data, 'create')
    assert response.status_code == 502
    assert 'private detail' not in str(response.data)
    assert Order.objects.count() == 0 and cart.items.count() == 1


def test_payment_confirmation_is_idempotent_and_scoped_to_owner(setup):
    client, user, product, cart, data = setup
    gateway = MagicMock()
    gateway.order.create.return_value = {'id': 'gateway-order'}
    gateway.payment.fetch.return_value = {'order_id': 'gateway-order', 'amount': 20000, 'currency': 'INR', 'status': 'captured'}
    payload = {'razorpay_order_id': 'gateway-order', 'razorpay_payment_id': 'payment-1', 'razorpay_signature': 'signature'}
    with patch('apps.orders.views.payment_client', return_value=gateway):
        assert create(client, data, 'create').status_code == 201
        assert cart.items.count() == 1
        other = APIClient(); other.force_authenticate(User.objects.create_user('other'))
        assert other.post('/api/orders/verify-payment/', payload).status_code == 404
        for _ in range(2):
            assert client.post('/api/orders/verify-payment/', payload).status_code == 200
    product.refresh_from_db(); assert product.stock == 3
    assert cart.items.count() == 0 and Order.objects.get().payment_status == 'paid'


def test_uncaptured_payment_does_not_fulfill(setup):
    client, user, product, cart, data = setup
    gateway = MagicMock(); gateway.order.create.return_value = {'id': 'gateway-order'}
    gateway.payment.fetch.return_value = {'order_id': 'gateway-order', 'amount': 20000, 'currency': 'INR', 'status': 'authorized'}
    with patch('apps.orders.views.payment_client', return_value=gateway):
        create(client, data, 'create')
        response = client.post('/api/orders/verify-payment/', {'razorpay_order_id': 'gateway-order', 'razorpay_payment_id': 'p', 'razorpay_signature': 's'})
    assert response.status_code == 400
    product.refresh_from_db(); assert product.stock == 5
    assert cart.items.count() == 1


def test_captured_payment_with_changed_stock_goes_to_review(setup):
    client, user, product, cart, data = setup
    gateway = MagicMock(); gateway.order.create.return_value = {'id': 'gateway-order'}
    gateway.payment.fetch.return_value = {'order_id': 'gateway-order', 'amount': 20000, 'currency': 'INR', 'status': 'captured'}
    with patch('apps.orders.views.payment_client', return_value=gateway):
        create(client, data, 'create')
        product.stock = 0; product.save()
        response = client.post('/api/orders/verify-payment/', {'razorpay_order_id': 'gateway-order', 'razorpay_payment_id': 'p', 'razorpay_signature': 's'})
    assert response.status_code == 409
    assert Order.objects.get().payment_status == 'review'
    assert cart.items.count() == 1


def test_duplicate_cart_rows_cannot_oversell(setup):
    client, user, product, cart, data = setup
    CartItem.objects.create(cart=cart, product=product, quantity=4)
    assert create(client, data).status_code == 400
    product.refresh_from_db(); assert product.stock == 5
    assert Order.objects.count() == 0


def test_cart_rejects_invalid_quantities(setup):
    client, user, product, cart, data = setup
    for quantity in [-1, 'oops', 1.5, 0]:
        response = client.post('/api/cart/add/', {'product_id': product.pk, 'quantity': quantity})
        assert response.status_code == 400
    assert cart.items.get().quantity == 2
