# SoleMate 👟

> A full-stack multi-seller e-commerce marketplace built with Django + React. Razorpay payments, JWT authentication, Google OAuth, seller dashboards, and production deployment on AWS EC2.

## 📸 Screenshots

### Home Page

![Home](solemate-home.png)

Multi-vendor E-commerce Platform built using Django REST Framework and React.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://ecommerce-django-two.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-black)](https://github.com/iamsaiteja/ecommerce-django)

[![Python](https://img.shields.io/badge/Python-3.10+-blue)]()
[![Django](https://img.shields.io/badge/Django-Backend-green)]()
[![DRF](https://img.shields.io/badge/REST-API-red)]()
[![React](https://img.shields.io/badge/React-Frontend-61DAFB)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)]()
[![AWS EC2](https://img.shields.io/badge/AWS-EC2-orange)]()
[![Razorpay](https://img.shields.io/badge/Razorpay-Payments-blue)]()
[![Google OAuth](https://img.shields.io/badge/Google-OAuth-red)]()

---

## ✨ Features

### 🛒 For Customers
- Browse multi-seller catalog with categories, search, and filters
- Shopping cart with coupon support
- Secure Razorpay payment integration
- Order tracking with real-time status updates
- Product reviews and ratings
- Google OAuth one-click login + email/password
- Profile management with multiple addresses

### 🏪 For Sellers
- Dedicated seller dashboard with sales analytics
- Product management (create, update, archive)
- Order fulfillment workflow
- Approval-based onboarding (admin verification)

// 🔐 For Admins //
- Django admin panel for full control
- Seller approval workflow
- Coupon and discount management
- User and order moderation

---

// 🏗️ Architecture //
┌──────────────────┐        ┌──────────────────┐        ┌─────────────────┐

│   React Frontend │ ─────► │  Django Backend  │ ─────► │   PostgreSQL    │

│   Vercel         │  JWT   │  AWS EC2         │        │   (Database)    │

└──────────────────┘        └────────┬─────────┘        └─────────────────┘

│

┌──────────┼──────────┐

▼          ▼          ▼

┌─────────┐ ┌─────────┐ ┌──────────┐

│Razorpay │ │ Google  │ │  Nginx   │

│Payments │ │  OAuth  │ │ Gunicorn │

└─────────┘ └─────────┘ └──────────┘


### Authentication Flow

1. User logs in via Google OAuth or email/password
2. Backend issues JWT (access + refresh tokens) via SimpleJWT
3. Frontend stores token, attaches `Authorization: Bearer` header
4. Refresh token rotation on expiry
5. Role-based access (customer / seller / admin)

### Payment Flow

1. User checks out cart → backend creates Razorpay order
2. Razorpay checkout opens with order ID
3. User completes payment → Razorpay webhook to backend
4. Backend verifies signature → marks order paid → notifies seller
5. Order status updates trigger customer email

---

## 🛠️ Tech Stack

### Backend
- **Django 5** — Python web framework
- **Django REST Framework** — REST API
- **SimpleJWT** — JWT authentication
- **django-allauth** — Google OAuth integration
- **PostgreSQL** — Production database
- **Razorpay Python SDK** — Payment processing

### Frontend
- **React 19** — UI framework
- **React Router** — Client-side routing
- **Axios** — HTTP client with interceptors
- **Tailwind CSS** — Styling
- **Razorpay Checkout** — Payment widget

### DevOps & Infrastructure
- **AWS EC2** — Backend hosting (Ubuntu)
- **Nginx** — Reverse proxy + static file serving
- **Gunicorn** — WSGI application server
- **Vercel** — Frontend hosting
- **GitHub Actions** — CI/CD pipeline (auto-deploy on push to main)
- **Let's Encrypt** — HTTPS/SSL certificates

---

## 🚀 Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (or SQLite for dev)
- Razorpay account ([sign up here](https://razorpay.com))
- Google Cloud Console OAuth credentials

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/iamsaiteja/ecommerce-django.git
cd ecommerce-django

# Virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Create .env file in project root
```

**`.env` file:**
```env
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgres://user:pass@localhost/solemate

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

```bash
# Migrations
python manage.py makemigrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Run server
python manage.py runserver
```

Backend runs on `http://localhost:8000`.

### Frontend Setup

Frontend is in a separate repo: [solemate-frontend](https://github.com/iamsaiteja/solemate-frontend)

```bash
cd solemate-frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`.

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register/` | Create new account |
| `POST` | `/api/auth/login/` | Get JWT access + refresh tokens |
| `POST` | `/api/auth/refresh/` | Refresh access token |
| `POST` | `/api/auth/google/` | Google OAuth login |
| `POST` | `/api/auth/logout/` | Blacklist refresh token |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/products/` | List all products |
| `GET`  | `/api/products/?search=nike` | Search products |
| `GET`  | `/api/products/{slug}/` | Product detail |
| `GET`  | `/api/products/{slug}/reviews/` | Product reviews |
| `POST` | `/api/products/{slug}/reviews/` | Post a review (auth) |
| `GET`  | `/api/categories/` | All categories |

### Cart & Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/cart/` | Get current cart |
| `POST` | `/api/cart/add/` | Add item to cart |
| `POST` | `/api/orders/create/` | Create Razorpay order |
| `POST` | `/api/orders/verify/` | Verify Razorpay payment |
| `GET`  | `/api/orders/` | My order history |

### Seller (auth + approval required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/seller/dashboard/` | Sales analytics |
| `POST` | `/api/seller/products/` | Create product |
| `GET`  | `/api/seller/orders/` | Orders for seller's products |

**Authentication example:**
```bash
# Get token
curl -X POST https://solemate.servecounterstrike.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'

# Use token
curl -H "Authorization: Bearer eyJ..." \
  https://solemate.servecounterstrike.com/api/orders/
```

---

## 💳 Razorpay Test Mode

For local testing, use these test credentials:

| Field | Value |
|-------|-------|
| Card Number | `4111 1111 1111 1111` |
| CVV | Any 3 digits |
| Expiry | Any future date |
| OTP | `1234` |

---

## 📂 Project Structure

ecommerce-django/

├── apps/

│   ├── users/          # Auth, profiles, addresses

│   ├── products/       # Products, categories, reviews

│   ├── cart/           # Shopping cart logic

│   ├── orders/         # Orders + Razorpay integration

│   ├── sellers/        # Seller dashboard & approval

│   ├── coupons/        # Discount coupon system

│   └── api/            # REST API endpoints

├── templates/          # Django templates (Tailwind)

├── static/             # CSS, JS, images

├── ecommerce/          # Django settings, URLs, WSGI

├── requirements.txt

├── manage.py

└── .github/

└── workflows/

└── deploy.yml  # GitHub Actions CI/


---

## 🚢 Deployment

### Production Stack
- **Backend:** AWS EC2 (Ubuntu) + Nginx + Gunicorn
- **Database:** PostgreSQL on EC2
- **Frontend:** Vercel (auto-deploy from GitHub)
- **CI/CD:** GitHub Actions (push to `main` → SSH to EC2 → pull + restart)
- **SSL:** Let's Encrypt via Certbot
- **Domain:** Custom subdomain via DuckDNS

### GitHub Actions workflow (simplified)
```yaml
on: push: { branches: [main] }
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to EC2
        uses: appleboy/ssh-action@v0.1.10
        with:
          host: ${{ secrets.EC2_HOST }}
          key: ${{ secrets.EC2_KEY }}
          script: |
            cd /home/ubuntu/ecommerce-django
            git fetch && git reset --hard origin/main
            source venv/bin/activate
            pip install -r requirements.txt
            python manage.py migrate
            sudo systemctl restart gunicorn
```

---

## 🗺️ Roadmap

- [ ] Wishlist functionality
- [ ] Real-time order tracking with WebSockets
- [ ] Seller payout system (Razorpay Route)
- [ ] Product recommendations (collaborative filtering)
- [ ] Mobile app (React Native)
- [ ] Email notifications (Celery + SendGrid)
- [ ] Multi-currency support
- [ ] Advanced analytics for sellers

---

## 🎯 Key Engineering Challenges Solved

1. **Google OAuth redirect_uri_mismatch on production** — Resolved with conditional `if DEBUG` HTTP/HTTPS handling
2. **Custom SocialAccountAdapter wrong redirect** — Fixed Nginx local IP issue with `FRONTEND_URL` env var
3. **Cart 401 errors** — Replaced hardcoded `BASE_URL` with environment-based config in `api.js`
4. **GitHub Actions deployment conflicts** — Switched from `git pull` to `git fetch && git reset --hard` for clean deploys
5. **Production CORS + ALLOWED_HOSTS** — Configured Django middleware properly for cross-origin requests

---

## 👨‍💻 Author

**Sai Teja Golla**
- 💼 LinkedIn: [@golla-saiteja](https://www.linkedin.com/in/golla-saiteja)
- 🐙 GitHub: [@iamsaiteja](https://github.com/iamsaiteja)
- 📧 tejayadav872@gmail.com

---

## 📜 License

MIT License — feel free to learn from this and adapt it.

---

⭐ If you found this useful, give it a star!

