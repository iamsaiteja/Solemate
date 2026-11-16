from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status


class AuthAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='Test@1234'
        )

    def test_user_created(self):
        self.assertEqual(User.objects.count(), 1)

    def test_login_api(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'Test@1234'
        })
        self.assertEqual(response.status_code, 200)


    def test_wrong_password_is_rejected(self):
        response = self.client.post('/api/auth/login/', {'username': 'testuser', 'password': 'wrong'})
        self.assertEqual(response.status_code, 401)
        self.assertNotIn('access', response.data)


class ProductAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_products_list(self):
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class CartAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='cartuser',
            email='cart@test.com',
            password='Test@1234'
        )
        self.client.force_authenticate(user=self.user)

    def test_cart_requires_auth(self):
        self.client.logout()
        response = self.client.get('/api/cart/')
        self.assertIn(response.status_code, [401, 403])


class OrderAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='orderuser',
            email='order@test.com',
            password='Test@1234'
        )
        self.client.force_authenticate(user=self.user)

    def test_orders_list(self):
        response = self.client.get('/api/orders/')
        self.assertEqual(response.status_code, 200)
