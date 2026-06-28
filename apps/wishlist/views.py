from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import WishlistItem
from apps.products.models import Product

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wishlist(request):
    items = []
    for item in WishlistItem.objects.filter(user=request.user).select_related('product'):
        items.append({
            'id': item.id,
            'product': {
                'id': item.product.id,
                'name': item.product.name,
                'price': str(item.product.price),
                'image': f"/media/{item.product.image}" if item.product.image else None,
            },
        })
    return Response({'items': items, 'count': len(items)})

# heart nokkithe — like undte teesey, lekapothe add chey (toggle)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_wishlist(request):
    product_id = request.data.get('product_id')
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)

    item = WishlistItem.objects.filter(user=request.user, product=product).first()
    if item:
        item.delete()
        return Response({'message': 'Removed', 'liked': False})
    WishlistItem.objects.create(user=request.user, product=product)
    return Response({'message': 'Added', 'liked': True})

# Products page lo ye hearts red ga chupinchalo telusukovadaniki
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wishlist_ids(request):
    ids = WishlistItem.objects.filter(user=request.user).values_list('product_id', flat=True)
    return Response({'product_ids': list(ids)})