from django.shortcuts import redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .models import Coupon


@login_required
def apply_coupon(request):
    if request.method == 'POST':
        code = request.POST.get('code', '').strip().upper()
        try:
            coupon = Coupon.objects.get(code=code)
            if coupon.is_valid():
                request.session['coupon_id'] = coupon.id
                messages.success(request, f'Coupon "{code}" applied!')
            else:
                messages.error(request, 'Coupon is expired or invalid.')
        except Coupon.DoesNotExist:
            messages.error(request, 'Invalid coupon code.')
    return redirect('cart')


@login_required
def remove_coupon(request):
    if 'coupon_id' in request.session:
        del request.session['coupon_id']
    messages.info(request, 'Coupon removed.')
    return redirect('cart')


# ===== REST API (React frontend) =====
from decimal import Decimal, InvalidOperation
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_coupon(request):
    """Validate a coupon code against the given cart total and return the discount."""
    code = (request.data.get('code') or '').strip().upper()
    try:
        total = Decimal(str(request.data.get('total') or '0'))
    except (InvalidOperation, TypeError):
        return Response({'valid': False, 'error': 'Invalid total'}, status=400)

    if not code:
        return Response({'valid': False, 'error': 'Enter a coupon code'}, status=400)

    try:
        coupon = Coupon.objects.get(code__iexact=code)
    except Coupon.DoesNotExist:
        return Response({'valid': False, 'error': 'Invalid coupon code'}, status=404)

    if not coupon.is_valid():
        return Response({'valid': False, 'error': 'This coupon has expired'}, status=400)

    if total < coupon.min_purchase:
        return Response({
            'valid': False,
            'error': f'Minimum order of ₹{coupon.min_purchase:.0f} required for {coupon.code}',
        }, status=400)

    discount = coupon.get_discount(total)
    if discount <= 0:
        return Response({'valid': False, 'error': 'Coupon not applicable'}, status=400)

    return Response({
        'valid': True,
        'code': coupon.code,
        'coupon_type': coupon.coupon_type,
        'value': str(coupon.value),
        'discount': str(discount.quantize(Decimal('0.01'))),
        'payable': str((total - discount).quantize(Decimal('0.01'))),
    })
