"""Transactional checkout primitives. Prices and stock always come from the server."""
from decimal import Decimal
from django.db import transaction
from django.db.models import F
from rest_framework.exceptions import ValidationError
from apps.cart.models import Cart
from apps.products.models import Product
from apps.coupons.models import Coupon
from .models import Order, OrderItem


def lock_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    cart = Cart.objects.select_for_update().get(pk=cart.pk)
    items = list(cart.items.select_related('product').order_by('product_id'))
    if not items:
        raise ValidationError('Cart is empty.')
    products = {p.pk: p for p in Product.objects.select_for_update().filter(
        pk__in=[i.product_id for i in items]).order_by('pk')}
    demand = {}
    for item in items:
        demand[item.product_id] = demand.get(item.product_id, 0) + item.quantity
    for item in items:
        p = products[item.product_id]
        if not p.is_active or item.quantity < 1 or p.stock < demand[item.product_id]:
            raise ValidationError(f'{p.name} is unavailable in the requested quantity.')
        item.product = p
    return cart, items


def price_order(data, items):
    total = sum((i.get_subtotal() for i in items), Decimal('0'))
    code = str(data.get('coupon_code') or '').strip().upper()
    discount = Decimal('0')
    if code:
        coupon = Coupon.objects.select_for_update().filter(code__iexact=code).first()
        if coupon is None or not coupon.is_valid():
            raise ValidationError('Coupon is invalid or expired.')
        discount = coupon.get_discount(total)
        if not discount:
            raise ValidationError('Coupon minimum purchase is not met.')
    # Never grant a payment-method discount from an untrusted client field.
    return (total - discount).quantize(Decimal('0.01')), discount, code


def save_items(order, items):
    OrderItem.objects.bulk_create([OrderItem(order=order, product=i.product,
        product_name=i.product.name, quantity=i.quantity, price=i.product.price) for i in items])


def fulfill(order):
    """Called under atomic/order lock; either all inventory changes succeed or none do."""
    items = list(order.items.order_by('product_id'))
    products = {p.pk: p for p in Product.objects.select_for_update().filter(
        pk__in=[i.product_id for i in items]).order_by('pk')}
    demand = {}
    for item in items:
        demand[item.product_id] = demand.get(item.product_id, 0) + item.quantity
    for item in items:
        product = products.get(item.product_id)
        if product is None or not product.is_active or product.stock < demand[item.product_id]:
            raise ValidationError('Stock changed. Paid orders require manual refund/reconciliation.')
    if order.coupon_code:
        coupon = Coupon.objects.select_for_update().filter(code__iexact=order.coupon_code).first()
        if coupon is None or not coupon.is_valid():
            raise ValidationError('Coupon availability changed; payment needs review.')
        coupon.used_count = F('used_count') + 1
        coupon.save(update_fields=['used_count'])
    for item in items:
        Product.objects.filter(pk=item.product_id).update(stock=F('stock') - item.quantity)
    cart = Cart.objects.select_for_update().filter(user=order.user).first()
    if cart:
        for item in items:
            # Preserve products/quantities added while the payment was in progress.
            for current in cart.items.filter(product_id=item.product_id):
                if current.quantity <= item.quantity:
                    current.delete()
                else:
                    current.quantity = F('quantity') - item.quantity
                    current.save(update_fields=['quantity'])
