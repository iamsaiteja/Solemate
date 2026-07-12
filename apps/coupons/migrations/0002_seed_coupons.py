from datetime import timedelta

from django.db import migrations
from django.utils import timezone


COUPONS = [
    # code, percent, min_purchase, max_discount
    ("SOLE20", 20, 1999, 1500),
    ("SOLE30", 30, 3999, 2500),
    ("SOLE70", 70, 5999, 5000),
]


def seed_coupons(apps, schema_editor):
    Coupon = apps.get_model("coupons", "Coupon")
    now = timezone.now()
    for code, percent, min_purchase, max_discount in COUPONS:
        Coupon.objects.update_or_create(
            code=code,
            defaults={
                "coupon_type": "percentage",
                "value": percent,
                "min_purchase": min_purchase,
                "max_discount": max_discount,
                "is_active": True,
                "valid_from": now,
                "valid_to": now + timedelta(days=365),
                "usage_limit": 100000,
            },
        )


def unseed_coupons(apps, schema_editor):
    Coupon = apps.get_model("coupons", "Coupon")
    Coupon.objects.filter(code__in=[c[0] for c in COUPONS]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("coupons", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_coupons, unseed_coupons),
    ]
