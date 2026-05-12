import google.generativeai as genai
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Product


@api_view(['GET'])
def product_list(request):
    products = Product.objects.filter(is_active=True).select_related('category')
    data = []
    for p in products:
        data.append({
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'price': str(p.price),
            'stock': p.stock,
            'category': p.category.name if p.category else None,
            'image': p.image.url if p.image else None,
        })
    return Response(data)


@api_view(['GET'])
def product_detail(request, pk):
    try:
        p = Product.objects.get(id=pk, is_active=True)
        reviews = [{'user': r.user.username, 'rating': r.rating, 'comment': r.comment} for r in p.reviews.all()]
        data = {
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'price': str(p.price),
            'stock': p.stock,
            'category': p.category.name if p.category else None,
            'image': p.image.url if p.image else None,
            'reviews': reviews,
        }
        return Response(data)
    except Product.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)


@api_view(['POST'])
@permission_classes([])
def ai_product_search(request):
    query = request.data.get('query', '')

    if not query:
        return Response({'error': 'Query required'}, status=400)

    products = Product.objects.filter(is_active=True)[:20]
    product_list = "\n".join([
        f"- {p.name}: ₹{p.price}" for p in products
    ])

    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')

    prompt = f"""
You are a shoe shopping assistant for SoleMate.
Customer query: {query}
Available products:
{product_list}
Suggest the best matching products and explain why.
Keep response short and helpful.
"""
    response = model.generate_content(prompt)

    return Response({
        'query': query,
        'suggestion': response.text
    })