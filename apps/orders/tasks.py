from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def send_order_confirmation_email(self, order_id):
    """
    Order place అయినప్పుడు customer కి email పంపే task.
    bind=True → self access కోసం (retry చేయడానికి)
    max_retries=3 → fail అయితే 3 సార్లు try చేస్తుంది
    """
    try:
        from apps.orders.models import Order  # avoid circular import
        
        order = Order.objects.get(id=order_id)
        customer_email = order.user.email
        
        send_mail(
            subject=f"✅ Order Confirmed! #{order.id}",
            message=f"""
Hi {order.user.username},

Your order #{order.id} has been confirmed!
Total: ₹{order.total_amount}

Thank you for shopping at SoleMate! 👟

Regards,
SoleMate Team
            """,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[customer_email],
            fail_silently=False,
        )
        
        logger.info(f"✅ Email sent for order {order_id}")
        return f"Email sent to {customer_email}"
        
    except Order.DoesNotExist:
        logger.error(f"❌ Order {order_id} not found")
        raise  # retry 
       
    except Exception as exc:
        logger.error(f"❌ Email failed for order {order_id}: {exc}")
        
        raise self.retry(exc=exc, countdown=60)