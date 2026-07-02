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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    shipping_address = request.data.get('shipping_address', '')
    phone = request.data.get('phone', '')

    try:
        cart = Cart.objects.get(user=request.user)
        cart_items = list(cart.items.select_related('product').all())

        if not cart_items:
            return Response({'error': 'Cart is empty'}, status=400)

        total = sum(item.get_subtotal() for item in cart_items)

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        razorpay_order = client.order.create({
            'amount': int(total * 100),
            'currency': 'INR',
            'payment_capture': 1,
        })

        order = Order.objects.create(
            user=request.user,
            total_amount=total,
            shipping_address=shipping_address,
            phone=phone,
            razorpay_order_id=razorpay_order['id'],
        )

        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                quantity=item.quantity,
                price=item.product.price,
            )

        cart.items.all().delete()

        return Response({
            'order_id': order.id,
            'razorpay_order_id': razorpay_order['id'],
            'amount': int(total * 100),
            'currency': 'INR',
            'key': settings.RAZORPAY_KEY_ID,
            'name': request.user.get_full_name() or request.user.username,
            'email': request.user.email,
        })

    except Cart.DoesNotExist:
        return Response({'error': 'Cart not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    razorpay_payment_id = request.data.get('razorpay_payment_id')
    razorpay_order_id = request.data.get('razorpay_order_id')
    razorpay_signature = request.data.get('razorpay_signature')

    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    try:
        client.utility.verify_payment_signature({
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature,
        })
        order = Order.objects.get(razorpay_order_id=razorpay_order_id, user=request.user)
        order.razorpay_payment_id = razorpay_payment_id
        order.payment_status = 'paid'
        order.status = 'processing'
        order.save()

        send_order_email(order)  # confirmation email

        return Response({'message': 'Payment successful!', 'order_id': order.id})
    except Exception:
        return Response({'error': 'Payment verification failed'}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_orders(request):
    orders = Order.objects.filter(user=request.user).prefetch_related('items')
    data = []
    for order in orders:
        data.append({
            'id': order.id,
            'total_amount': str(order.total_amount),
            'status': order.status,
            'payment_status': order.payment_status,
            'shipping_address': order.shipping_address,
            'created_at': order.created_at.strftime('%d %b %Y'),
            'items': [
                {
                    'product_name': item.product_name,
                    'quantity': item.quantity,
                    'price': str(item.price),
                    'subtotal': str(item.get_subtotal()),
                }
                for item in order.items.all()
            ],
        })
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_cod_order(request):
    shipping_address = request.data.get('shipping_address', '')
    phone = request.data.get('phone', '')

    try:
        cart = Cart.objects.get(user=request.user)
        cart_items = list(cart.items.select_related('product').all())

        if not cart_items:
            return Response({'error': 'Cart is empty'}, status=400)

        total = sum(item.get_subtotal() for item in cart_items)

        order = Order.objects.create(
            user=request.user,
            total_amount=total,
            shipping_address=shipping_address,
            phone=phone,
            payment_status='cod',
            status='pending'
        )

        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                quantity=item.quantity,
                price=item.product.price,
            )

        cart.items.all().delete()

        send_order_email(order)  # confirmation email

        return Response({
            'message': 'Order placed successfully!',
            'order_id': order.id
        })

    except Cart.DoesNotExist:
        return Response({'error': 'Cart not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)