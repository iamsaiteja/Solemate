import csv
import os
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from apps.products.models import Product, Category


class Command(BaseCommand):
    help = 'Load products from CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str)

    def handle(self, *args, **kwargs):
        csv_file = kwargs['csv_file']

        if not os.path.exists(csv_file):
            self.stdout.write(self.style.ERROR(f'File not found: {csv_file}'))
            return

        created_count = 0

        with open(csv_file, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Category get or create
                category, _ = Category.objects.get_or_create(
                    name=row['category'],
                    defaults={'slug': slugify(row['category'])}
                )

                # Unique slug
                base_slug = slugify(row['name'])
                slug = base_slug
                counter = 1
                while Product.objects.filter(slug=slug).exists():
                    slug = f"{base_slug}-{counter}"
                    counter += 1

                Product.objects.create(
                    name=row['name'],
                    slug=slug,
                    description=row['description'],
                    price=row['price'],
                    stock=row['stock_quantity'],
                    category=category,
                    is_active=row['is_active'] == 'True',
                    is_featured=row['is_featured'] == 'True',
                )
                created_count += 1

        self.stdout.write(self.style.SUCCESS(
            f'✅ Successfully loaded {created_count} products!'
        ))
        