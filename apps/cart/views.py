from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Cart, CartItem
from apps.products.models import Product

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):
    cart, _ = Cart.objects.get_or_create(user=request.user)
    items = []
    for item in cart.items.select_related('product').all():
        items.append({
            'id': item.id,
            'product': {
                'id': item.product.id,
                'name': item.product.name,
                'price': str(item.product.price),
                'image': f"/media/{item.product.image}" if item.product.image else None,
            },
            'quantity': item.quantity,
            'subtotal': str(item.get_subtotal()),
        })
    return Response({'items': items, 'total': str(cart.get_total())})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    product_id = request.data.get('product_id')
    quantity = int(request.data.get('quantity', 1))
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)

    cart, _ = Cart.objects.get_or_create(user=request.user)
    item, created = CartItem.objects.get_or_create(cart=cart, product=product)
    if not created:
        item.quantity += quantity
    else:
        item.quantity = quantity
    item.save()
    return Response({'message': 'Added to cart', 'cart_count': cart.items.count()})

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cart_item(request, item_id):
    quantity = int(request.data.get('quantity', 1))
    try:
        cart = Cart.objects.get(user=request.user)
        item = CartItem.objects.get(id=item_id, cart=cart)
        if quantity <= 0:
            item.delete()
            return Response({'message': 'Item removed'})
        item.quantity = quantity
        item.save()
        return Response({'message': 'Updated', 'quantity': item.quantity})
    except (Cart.DoesNotExist, CartItem.DoesNotExist):
        return Response({'error': 'Item not found'}, status=404)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, item_id):
    try:
        cart = Cart.objects.get(user=request.user)
        item = CartItem.objects.get(id=item_id, cart=cart)
        item.delete()
        return Response({'message': 'Removed'})
    except (Cart.DoesNotExist, CartItem.DoesNotExist):
        return Response({'error': 'Not found'}, status=404)