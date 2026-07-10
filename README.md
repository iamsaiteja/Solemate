<div align="center">

# 👟 SOLEMATE

### A cinematic 3D sneaker marketplace — scroll it, spin it, own it.

**Full-stack multi-seller e-commerce** with a WebGL scroll-driven 3D hero, one glassmorphism design system across every page, UPI / Card / COD payments, JWT + Google OAuth, and seller dashboards.

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-ecommerce--django--two.vercel.app-e8ff3b?style=for-the-badge&labelColor=0a0a0e)](https://ecommerce-django-two.vercel.app/)

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)]()
[![Django](https://img.shields.io/badge/Django-6.0-092E20?logo=django)]()
[![DRF](https://img.shields.io/badge/DRF-REST_API-A30000)]()
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)]()
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-000000?logo=threedotjs)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)]()
[![Razorpay](https://img.shields.io/badge/Razorpay-UPI_·_Cards-0C2451)]()
[![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?logo=vercel)]()
[![AWS](https://img.shields.io/badge/AWS_EC2-Backend-FF9900?logo=amazonwebservices&logoColor=white)]()

</div>

---

## ✨ The Experience

Scroll the homepage and a **real glTF sneaker** pins to your screen, spins through five cinematic frames, and **physically changes colorway** (midnight → beach → street) as backgrounds, rim-lights and giant parallax watermarks morph around it. Drag the shoe to spin it yourself.

| The 3D Hero | Colorways morph on scroll |
|:---:|:---:|
| ![Home hero](docs/screenshots/home-hero.jpg) | ![Street DNA frame](docs/screenshots/home-street.jpg) |
| **Glass storefront** | **UPI · Card · COD checkout** |
| ![Products](docs/screenshots/products.jpg) | ![Checkout](docs/screenshots/checkout.jpg) |

Every page — Products, Details, Cart, Wishlist, Orders, Auth, Settings, Seller Dashboard — shares **one cinematic design system**: dark cinema gradients, glassmorphism panels, Bebas Neue display type, a `#e8ff3b` signature accent, scroll-reveal animations, 3D-tilt cards and blurred page transitions.

---

## 🚀 Feature Tour

### 🛍️ For Sneakerheads
- **Scroll-driven 3D hero** — 22.7k-triangle glTF sneaker, KHR material variants, particles, contact shadows, drag-to-spin
- **AI product search** with graceful fallback to instant local filtering
- Catalog with category mega-menus, brand/gender/price filters and sorting
- Product pages with size picker, quantity, star ratings and reviews
- Wishlist with optimistic toggling
- Cart with animated count-up totals, free-shipping progress and delivery estimates
- **Checkout with UPI (GPay · PhonePe · Paytm), Cards and Cash-on-Delivery** via Razorpay
- Order history with a visual tracking timeline (Ordered → Processing → Shipped → Delivered)
- Login with **Google OAuth** or username/password (JWT)
- Theme (dark / light / auto) and language (English · తెలుగు · हिंदी) settings

### 🏪 For Sellers
- Dashboard with revenue and order analytics
- Per-item order table with status and payment state

### 🔐 For Admins
- Django admin for products, categories, coupons, users and orders
- Seller approval workflow

---

## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph Client["React 19 SPA · Vercel"]
        UI["Cinematic design system + Three.js 3D hero"]
    end
    subgraph Server["Django 6 + DRF · AWS EC2"]
        API["REST API · SimpleJWT · allauth"]
        CEL["Celery workers"]
    end
    DB[("PostgreSQL")]
    RZP["Razorpay: UPI · Cards"]
    GO["Google OAuth"]
    CLD["Cloudinary media"]

    UI -- "Axios + Bearer JWT" --> API
    API --> DB
    API --> RZP
    API --> GO
    API --> CLD
    API --> CEL
```

### 💳 Payment flow

```mermaid
sequenceDiagram
    participant C as Customer
    participant F as React Frontend
    participant B as Django API
    participant R as Razorpay

    C->>F: Choose UPI / Card / COD
    alt COD
        F->>B: POST /orders/create-cod/
        B-->>F: Order confirmed 🎉
    else UPI or Card
        F->>B: POST /orders/create/
        B->>R: Create Razorpay order
        R-->>F: Checkout opens (GPay / PhonePe / Paytm / Card)
        C->>R: Completes payment
        F->>B: POST /orders/verify-payment/
        B->>R: Verify signature
        B-->>F: Order paid ✅ confetti 🎊
    end
```

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| **Frontend** | React 19, React Router 7, Axios, Three.js (glTF + KHR_materials_variants), Create React App |
| **Design system** | Hand-rolled CSS tokens (`cinematic.css`), glassmorphism, Bebas Neue / DM Sans / Space Mono, IntersectionObserver reveals, rAF pointer-tilt — **zero animation libraries** |
| **Backend** | Django 6, Django REST Framework, SimpleJWT, django-allauth (Google OAuth), Celery, Cloudinary |
| **Database** | PostgreSQL (SQLite for local dev) |
| **Payments** | Razorpay — UPI intent (GPay · PhonePe · Paytm), cards, COD |
| **Infra** | AWS EC2 + Nginx + Gunicorn (API), Vercel (SPA), GitHub Actions CI/CD, Let's Encrypt |

---

## 📂 Monorepo Layout

```
Solemate/
├── apps/                  # Django apps
│   ├── api/               #   REST endpoints
│   ├── users/             #   Auth, profiles, Google OAuth
│   ├── products/          #   Catalog, categories, reviews, AI search
│   ├── cart/              #   Shopping cart
│   ├── orders/            #   Orders + Razorpay integration
│   ├── wishlist/          #   Wishlist toggles
│   ├── sellers/           #   Seller dashboard & approval
│   └── coupons/           #   Discounts
├── ecommerce/             # Django settings, urls, celery, wsgi
├── frontend/              # React SPA
│   └── src/
│       ├── components/
│       │   ├── Sneaker3DExperience.jsx   # 🎬 the 3D scroll hero
│       │   ├── Navbar.jsx                # glass nav + mega menus
│       │   └── ui/                       # PageShell · Reveal · Tilt · Footer
│       ├── styles/cinematic.css          # 🎨 the design system
│       ├── pages/                        # Home, Products, Cart, Orders…
│       └── utils/                        # axios client, hooks
├── media/                 # Product images
└── manage.py
```

---

## ⚡ Quick Start

### 1 · Backend (Django)

```bash
git clone https://github.com/iamsaiteja/Solemate.git
cd Solemate

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` in the project root:

```env
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
FRONTEND_URL=http://localhost:3000

DATABASE_URL=postgres://user:pass@localhost/solemate   # or omit for SQLite

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver       # → http://localhost:8000
```

### 2 · Frontend (React) — lives in this repo

```bash
cd frontend
npm install
npm start                        # → http://localhost:3000
```

> Point the SPA at your API by editing `BASE_URL` in `frontend/src/utils/api.js`.

---

## 📡 API Reference

<details>
<summary><b>🔑 Authentication</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register/` | Create account, returns JWT pair |
| `POST` | `/api/auth/login/` | Access + refresh tokens |
| `POST` | `/api/auth/refresh/` | Rotate access token |
| `POST` | `/api/auth/google/` | Google OAuth login |

</details>

<details>
<summary><b>👟 Products & Reviews</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/products/` | Catalog |
| `GET`  | `/api/products/{id}/` | Detail with ratings & reviews |
| `POST` | `/api/products/{id}/review/` | Post review 🔒 |
| `POST` | `/api/products/ai-search/` | AI-powered search |

</details>

<details>
<summary><b>🛒 Cart, Wishlist & Orders</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/cart/` | Current cart 🔒 |
| `POST` | `/api/cart/add/` | Add item (with size) 🔒 |
| `PATCH`| `/api/cart/update/{id}/` | Change quantity 🔒 |
| `DELETE`| `/api/cart/remove/{id}/` | Remove item 🔒 |
| `GET`  | `/api/wishlist/` · `/api/wishlist/ids/` | Wishlist 🔒 |
| `POST` | `/api/wishlist/toggle/` | Like / unlike 🔒 |
| `POST` | `/api/orders/create/` | Create Razorpay order 🔒 |
| `POST` | `/api/orders/create-cod/` | Cash-on-delivery order 🔒 |
| `POST` | `/api/orders/verify-payment/` | Verify Razorpay signature 🔒 |
| `GET`  | `/api/orders/` | Order history with tracking 🔒 |

</details>

---

## 💳 Test Payments (Razorpay sandbox)

| Field | Value |
|-------|-------|
| Card | `4111 1111 1111 1111` · any CVV · any future expiry |
| UPI | success@razorpay |
| OTP | `1234` |

---

## 🎨 The Cinematic Design System

One source of truth — `frontend/src/styles/cinematic.css` — themes the whole app with CSS custom properties (`data-theme` flips dark ⇆ light):

| Piece | What it does |
|---|---|
| **Tokens** | `--cin-bg-*`, `--cin-accent` (#e8ff3b), glass surfaces, borders, glows |
| **`PageShell`** | Fixed gradient + glow backdrop, giant ghost watermark per page |
| **`Reveal`** | IntersectionObserver scroll-reveal — fires once, zero scroll listeners |
| **`Tilt`** | Pointer-tracked 3D card tilt + light sheen, rAF-batched CSS vars, no re-renders |
| **`RouteFade`** | Blur/fade page transitions with scroll reset |
| **`Sneaker3DExperience`** | 500vh pinned WebGL scrollytelling: keyframed camera/model choreography, variant switching, frame-rate-independent damping, reduced-motion & WebGL fallbacks |

Performance rules baked in: transform/opacity-only animations, lazy images, DPR-capped renderer that pauses off-screen, and **no animation libraries**.

---

## 🗺️ Roadmap

- [x] Wishlist ❤️
- [x] 3D scroll experience & cinematic design system
- [x] UPI / Card / COD payment selection
- [ ] Seller payout automation (Razorpay Route)
- [ ] Real-time order tracking (WebSockets)
- [ ] Product recommendations
- [ ] Email notifications (Celery + SendGrid)
- [ ] React Native mobile app

---

## 🧗 Engineering War Stories

1. **`position: sticky` silently dying** — an `overflow-x: hidden` page wrapper turned the page into a scroll container and unpinned the 3D hero; fixed with `overflow-x: clip`
2. **Route transitions breaking `position: fixed`** — a retained `filter` from `animation-fill-mode: both` made the route wrapper a containing block; keyframes now end at natural values
3. **7.8 MB glTF model → 0.96 MB** — 1024px WebP texture recompression while preserving KHR material variants
4. **Frame-rate-independent scrubbing** — `1 − e^(−λ·dt)` damping so 60 Hz, 120 Hz and slow devices all feel identical
5. **Google OAuth `redirect_uri_mismatch`** in production — conditional HTTP/HTTPS handling + `FRONTEND_URL` env

---

## 👨‍💻 Author

**Sai Teja Golla**
[LinkedIn](https://www.linkedin.com/in/golla-saiteja) · [GitHub](https://github.com/iamsaiteja) · tejayadav872@gmail.com

## 🙏 Credits

3D sneaker derived from [Materials Variants Shoe](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/MaterialsVariantsShoe) by Shopify (CC BY 4.0) — textures recompressed, geometry unchanged.

## 📜 License

MIT — learn from it, build on it.

<div align="center">

⭐ **If SoleMate made you scroll twice, drop a star!** ⭐

</div>
