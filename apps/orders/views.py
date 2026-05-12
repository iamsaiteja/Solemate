import razorpay
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Order, OrderItem
from apps.cart.models import Cart
from apps.orders.tasks import send_order_confirmation_email

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

        # Create Razorpay order
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        razorpay_order = client.order.create({
            'amount': int(total * 100),
            'currency': 'INR',
            'payment_capture': 1,
        })

        # Save order to DB
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

        # Clear cart after order created
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
        send_order_confirmation_email.delay(order.id)
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