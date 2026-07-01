import random
from django.core.management.base import BaseCommand
from apps.products.models import Product


class Command(BaseCommand):
    help = 'Set all product prices to a realistic Indian range (1000 - 10000)'

    def handle(self, *args, **kwargs):
        updated = 0
        for p in Product.objects.all():
            # 1000 - 9900 madhyalo, chivarlo 99 (ex: 2499, 4999, 7899)
            base = random.randint(10, 99) * 100
            p.price = base + 99
            p.save(update_fields=['price'])
            updated += 1

        self.stdout.write(self.style.SUCCESS(
            f'Updated {updated} product prices to Rs.1099 - Rs.9999'
        ))