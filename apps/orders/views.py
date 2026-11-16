import razorpay
from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from django.core.mail import send_mail
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Order, OrderItem
from apps.cart.models import Cart


# ====== ORDER CONFIRMATION EMAIL (direct — Celery avasaram ledu, reliable) ======
def send_order_email(order):
    try:
        if not order.user.email:
            return  # email lekapothe skip

        items = list(order.items.all())
        rows = ""
        for it in items:
            rows += (
                f"<tr>"
                f"<td style='padding:10px 0;border-bottom:1px solid #eee;color:#333'>{it.product_name} &nbsp;×&nbsp; {it.quantity}</td>"
                f"<td style='padding:10px 0;border-bottom:1px solid #eee;text-align:right;color:#111;font-weight:700'>₹{it.get_subtotal()}</td>"
                f"</tr>"
            )

        delivery = (timezone.now() + timedelta(days=4)).strftime('%a, %d %b %Y')
        pay_line = "Cash on Delivery" if order.payment_status == 'cod' else "Paid Online"

        html = f"""
<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#f5f5f5;padding:20px">
  <div style="background:#111;padding:28px;text-align:center;border-radius:16px 16px 0 0">
    <div style="color:#fff;font-size:30px;font-weight:800;letter-spacing:4px">SOLE<span style="color:#e8ff3b">MATE</span></div>
  </div>
  <div style="background:#fff;padding:32px 28px;border-radius:0 0 16px 16px">
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:44px">✅</div>
      <h1 style="color:#111;font-size:24px;margin:8px 0 4px">Order Confirmed!</h1>
      <p style="color:#888;font-size:14px;margin:0">Order #{str(order.id).zfill(4)} · {order.created_at.strftime('%d %b %Y')}</p>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      {rows}
      <tr>
        <td style="padding:16px 0 0;font-size:18px;font-weight:800;color:#111">Total</td>
        <td style="padding:16px 0 0;text-align:right;font-size:22px;font-weight:800;color:#111">₹{order.total_amount}</td>
      </tr>
    </table>

    <div style="background:#f8f8f8;border-radius:10px;padding:16px;margin-bottom:16px">
      <p style="margin:0 0 6px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px">Payment</p>
      <p style="margin:0;color:#111;font-weight:700">{pay_line}</p>
    </div>

    <div style="background:#f8f8f8;border-radius:10px;padding:16px;margin-bottom:16px">
      <p style="margin:0 0 6px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px">Delivery Address</p>
      <p style="margin:0;color:#444;line-height:1.5">{order.shipping_address}</p>
    </div>

    <div style="background:#dcfce7;border-radius:10px;padding:16px;text-align:center">
      <p style="margin:0;color:#15803d;font-weight:700">📦 Estimated delivery by {delivery}</p>
    </div>

    <p style="text-align:center;color:#aaa;font-size:12px;margin-top:28px">
      Thank you for shopping with SoleMate 👟<br>Track your order anytime in the Orders page.
    </p>
  </div>
</div>
"""

        send_mail(
            subject=f"✅ Order Confirmed #{str(order.id).zfill(4)} — SoleMate",
            message=f"Your order #{order.id} is confirmed! Total: ₹{order.total_amount}. Estimated delivery by {delivery}.",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[order.user.email],
            html_message=html,
            fail_silently=True,  # email fail aina order break avvakudadu
        )
    except Exception as e:
        print("Order email failed:", e)



import logging
import re
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError
from apps.cart.models import Cart
from .checkout import lock_cart, price_order, save_items, fulfill

logger = logging.getLogger(__name__)


def checkout_input(request):
    address = str(request.data.get('shipping_address') or '').strip()
    phone = str(request.data.get('phone') or '').strip()
    key = request.headers.get('Idempotency-Key', '')
    if not address or len(address) > 2000 or not re.fullmatch(r'[+0-9 ()-]{7,15}', phone):
        raise ValidationError('A shipping address and valid phone are required.')
    if not re.fullmatch(r'[a-zA-Z0-9_-]{16,64}', key):
        raise ValidationError('Send a unique Idempotency-Key (16–64 letters, digits, _ or -).')
    return address, phone, key


def payment_client():
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise ValidationError('Online payments are not configured.')
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


def order_response(order):
    return {'order_id': order.pk, 'razorpay_order_id': order.razorpay_order_id,
            'amount': int(order.total_amount * 100), 'currency': 'INR',
            'key': settings.RAZORPAY_KEY_ID, 'name': order.user.get_full_name() or order.user.username,
            'email': order.user.email, 'offer': order.coupon_code,
            'payment_status': order.payment_status}


def create_checkout(request, cod=False):
    address, phone, key = checkout_input(request)
    try:
        with transaction.atomic():
            # Serialize duplicate submissions from this user's cart.
            cart, _ = Cart.objects.get_or_create(user=request.user)
            Cart.objects.select_for_update().get(pk=cart.pk)
            existing = Order.objects.filter(user=request.user, checkout_key=key).first()
            if existing:
                return Response(order_response(existing))
            cart, items = lock_cart(request.user)
            total, discount, code = price_order(request.data, items)
            gateway_id = None
            if not cod:
                gateway_id = payment_client().order.create({
                    'amount': int(total * 100), 'currency': 'INR', 'payment_capture': 1,
                })['id']
            order = Order.objects.create(user=request.user, total_amount=total,
                shipping_address=address, phone=phone, checkout_key=key, coupon_code=code,
                razorpay_order_id=gateway_id, payment_status='cod' if cod else 'pending')
            save_items(order, items)
            if cod:
                fulfill(order)
                transaction.on_commit(lambda: send_order_email(order))
            result = order_response(order)
            result.update(discount=str(discount), message='Order created')
            return Response(result, status=201)
    except ValidationError:
        raise
    except Exception:
        logger.exception('Checkout failed')
        return Response({'error': 'Checkout failed. Your cart is preserved; retry with the same key.'}, status=502)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    return create_checkout(request)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_cod_order(request):
    return create_checkout(request, cod=True)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    gateway_id = request.data.get('razorpay_order_id')
    payment_id = request.data.get('razorpay_payment_id')
    signature = request.data.get('razorpay_signature')
    if not all(isinstance(v, str) and v for v in [gateway_id, payment_id, signature]):
        raise ValidationError('Payment id, order id and signature are required.')
    # Look up ownership before asking the gateway about a payment.
    order = get_object_or_404(Order, razorpay_order_id=gateway_id, user=request.user)
    client = payment_client()
    try:
        client.utility.verify_payment_signature({'razorpay_order_id': order.razorpay_order_id,
            'razorpay_payment_id': payment_id, 'razorpay_signature': signature})
        payment = client.payment.fetch(payment_id)
    except Exception:
        return Response({'error': 'Payment verification failed'}, status=400)
    if (payment.get('order_id') != order.razorpay_order_id or
        payment.get('amount') != int(order.total_amount * 100) or
        payment.get('currency') != 'INR' or payment.get('status') != 'captured'):
        return Response({'error': 'Payment is not captured for this order and amount.'}, status=400)
    with transaction.atomic():
        # Same lock order as checkout: cart, order, products, coupon.
        Cart.objects.select_for_update().filter(user=request.user).first()
        order = Order.objects.select_for_update().get(pk=order.pk)
        if order.payment_status == 'paid':
            return Response({'message': 'Payment already confirmed', 'order_id': order.pk})
        if order.payment_status == 'review':
            return Response({'error': 'Payment received; merchant review/refund required.'}, status=409)
        try:
            with transaction.atomic():
                fulfill(order)
        except ValidationError:
            order.payment_status = 'review'
            order.razorpay_payment_id = payment_id
            order.save(update_fields=['payment_status', 'razorpay_payment_id', 'updated_at'])
            logger.error('Paid order %s requires manual reconciliation', order.pk)
            return Response({'error': 'Payment received but stock/offer changed. Contact merchant for review/refund.'}, status=409)
        order.razorpay_payment_id = payment_id
        order.payment_status = 'paid'
        order.status = 'processing'
        order.save()
        transaction.on_commit(lambda: send_order_email(order))
    return Response({'message': 'Payment successful!', 'order_id': order.pk})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_orders(request):
    orders = Order.objects.filter(user=request.user).prefetch_related('items')
    return Response([{'id': o.pk, 'total_amount': str(o.total_amount), 'status': o.status,
        'payment_status': o.payment_status, 'shipping_address': o.shipping_address,
        'created_at': o.created_at.strftime('%d %b %Y'),
        'items': [{'product_name': i.product_name, 'quantity': i.quantity,
                   'price': str(i.price), 'subtotal': str(i.get_subtotal())} for i in o.items.all()]
    } for o in orders])
