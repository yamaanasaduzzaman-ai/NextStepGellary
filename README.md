# NEXSTEP GALLERY — Luxury Fashion & Lifestyle eCommerce Platform

> **Production-grade full-stack eCommerce application for Nexstep Gallery** — featuring an editorial storefront, transactional database architecture, multi-gateway checkout (Cash on Delivery, bKash, Nagad, SSLCommerz), inventory deduction and restock workflows, order tracking, and an executive administration dashboard.

---

## 1. Executive Summary & Brand Identity

* **Brand Name**: Nexstep Gallery
* **Industry**: High-end fashion, luxury pret, menswear, womenswear & heritage textiles
* **Aesthetic**: Minimalist luxury, architectural silhouettes, generous whitespace, charcoal/black `#111111`, off-white `#F8F7F4`, warm beige accent `#C6AE91`
* **Target Market**: Bangladesh nationwide (all 64 districts) and global diaspora
* **Primary Currency**: Bangladeshi Taka (BDT `৳`)

---

## 2. Technology Architecture

* **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React, Framer Motion
* **Backend**: Next.js Server Components, Server Actions & Route Handlers, service-oriented architecture (`productService`, `cartService`, `orderService`, `paymentService`, `couponService`, `inventoryService`, `reportService`)
* **Database & ORM**: PostgreSQL / SQLite via Prisma ORM with full relational schema, strict foreign keys, and atomic `$transaction` queries
* **Authentication**: Argon2id/Bcrypt password hashing, JSON Web Tokens (JWT) stored in HTTP-only, SameSite secure cookies, Role-Based Access Control (RBAC)
* **Payments (Bangladesh & Global)**:
  * **Cash on Delivery (COD)**: Zero-friction doorstep settlement
  * **bKash Merchant Direct**: Tokenized checkout simulation & live merchant verification
  * **Nagad Direct**: Merchant gateway adapter with server-side validation
  * **SSLCommerz**: Multi-card (Visa, MasterCard, Amex) & internet banking gateway with IPN validation
* **Logistics & Delivery**:
  * Dynamic zone rates: Inside Dhaka (৳70) vs. Outside Dhaka (৳130)
  * Free shipping engine for orders exceeding ৳3,000 threshold
  * Multi-courier integration adapters (Steadfast, Pathao, RedX)

---

## 3. Directory Layout

```
nexstep-gallery/
├── prisma/
│   ├── schema.prisma           # 30+ relational models (User, Product, Variant, Order, Payment, etc.)
│   └── dev.db                  # Local SQLite database (switchable to PostgreSQL for production)
├── scripts/
│   ├── seed.mjs                # Database seeder (categories, products, collections, admin, demo customer)
│   └── run-tests.mjs           # Automated QA suite (24 unit & integration tests)
├── src/
│   ├── app/
│   │   ├── (storefront)/
│   │   │   ├── page.tsx        # Editorial Homepage with hero banner, categories, new arrivals, lookbook
│   │   │   ├── shop/           # Shop All with multi-attribute filtering & sorting
│   │   │   ├── category/[slug] # Dynamic category archives
│   │   │   ├── product/[slug]  # Product details with zoom gallery, size selector & reviews
│   │   │   ├── cart/           # Shopping bag with coupon validation
│   │   │   ├── checkout/       # Multi-step checkout with live shipping calculation
│   │   │   ├── order-confirmation/[orderNumber] # Real-time order receipt & summary
│   │   │   ├── order-tracking/ # Public tracking with real-time status timeline
│   │   │   ├── login/ & register/ # Customer authentication
│   │   │   ├── account/        # Customer portal (orders, returns/exchanges, profile, addresses)
│   │   │   ├── wishlist/       # Client wishlist
│   │   │   ├── about/, contact/, size-guide/, faq/
│   │   │   └── policies/       # Shipping, Returns, Privacy, Terms
│   │   ├── admin/              # Executive Dashboard (/admin)
│   │   │   ├── page.tsx        # Real-time statistics, revenue, sales charts, recent orders
│   │   │   ├── products/       # Catalog management & new creation wizard
│   │   │   ├── inventory/      # Variant balances, stock adjustments & audit movements
│   │   │   ├── orders/         # Order processing, COD verification & courier dispatch
│   │   │   ├── categories/     # Department & capsule collections
│   │   │   ├── coupons/        # Promotion engine
│   │   │   ├── reviews/        # Review moderation
│   │   │   ├── returns/        # Return/exchange claims & restock triggers
│   │   │   ├── cms/            # Banners, announcements, blog
│   │   │   ├── reports/        # Financial gross/net breakdown & CSV export
│   │   │   ├── users/          # Staff personnel & RBAC privileges
│   │   │   └── settings/       # Shipping rates, currency, payment gateway toggles
│   │   └── api/                # REST endpoints (auth, products, cart, checkout, payments, etc.)
│   ├── components/
│   │   ├── layout/             # Header, AnnouncementBar, Footer
│   │   ├── cart/               # Slide-over CartDrawer
│   │   ├── product/            # ProductDetailClient
│   │   └── ui/                 # ProductCard & visual atoms
│   ├── context/                # AuthContext, CartContext, WishlistContext
│   └── lib/
│       ├── prisma.ts           # Singleton Prisma client
│       ├── auth.ts             # JWT, password hashing & RBAC helper
│       ├── utils.ts            # Currency formatter (৳), date formatting, cn helper
│       ├── bangladesh-geo.ts   # 8 Divisions, 64 Districts, delivery charge calculations
│       └── services/           # Backend business logic services
├── .env.example
├── next.config.mjs
├── tailwind.config.js
└── package.json
```

---

## 4. Local Installation & Setup Guide

### Prerequisites
* Node.js `v18.0.0` or higher (verified on Node `v24.18.0`)
* `npm` or `pnpm`

### Step 1: Clone or Navigate to Project
```bash
cd "C:\Users\YOU TECH BD\.gemini\antigravity\scratch\nexstep-gallery"
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` contains local SQLite configuration (`file:./dev.db`), development JWT secrets, and sandbox payment credentials.

### Step 4: Initialize Database & Seed Catalog
```bash
npm run db:push
npm run db:seed
```
This populates:
* Initial Super Admin account
* Demo Customer account
* Store Settings & Bangladesh delivery fees
* 8 Fashion Categories (Panjabi, Shirts, T-Shirts, Trousers, Jackets, Women, Men, Accessories)
* Curated capsule collections
* 7 luxury garments with multiple sizes, colors, SKUs, and initial stock intakes
* Active coupons (`NEXSTEP10`, `FLAT500`)
* Verified customer reviews, editorial banners, and FAQs

### Step 5: Run Automated Tests
```bash
npm test
```
Executes 24 automated QA tests validating shipping calculations, RBAC security, coupon limits, atomic checkout, inventory deductions, status transitions, and restocking.

### Step 6: Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Pre-configured Credentials

| Role | Email | Password | Access Route |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@nexstepgallery.com` | `AdminPassword2026!` | `/admin` |
| **Customer** | `customer@nexstepgallery.com` | `CustomerPassword2026!` | `/account` |

---

## 6. Payment Gateway Integration Guide

### 1. Cash on Delivery (COD)
* Fully active out-of-the-box.
* When a customer places an order via COD, order status is initialized as `PENDING` and payment status as `UNPAID`.
* Admin verifies and marks as `PAID` upon delivery receipt.

### 2. SSLCommerz
* Configure in `.env`:
  ```env
  SSLCOMMERZ_STORE_ID="your_store_id"
  SSLCOMMERZ_STORE_PASSWORD="your_store_password"
  SSLCOMMERZ_IS_SANDBOX="false"
  ```
* Webhook/IPN endpoint: `https://yourdomain.com/api/payments/sslcommerz/ipn`
* Success callback: `https://yourdomain.com/api/payments/sslcommerz/success`

### 3. bKash Merchant Direct
* Configure in `.env`:
  ```env
  BKASH_APP_KEY="your_app_key"
  BKASH_APP_SECRET="your_app_secret"
  BKASH_USERNAME="your_merchant_username"
  BKASH_PASSWORD="your_merchant_password"
  BKASH_IS_SANDBOX="false"
  ```
* Callback endpoint: `https://yourdomain.com/api/payments/bkash/callback`

### 4. Nagad Merchant Direct
* Configure in `.env`:
  ```env
  NAGAD_MERCHANT_ID="your_merchant_id"
  NAGAD_PUBLIC_KEY="your_public_key"
  NAGAD_PRIVATE_KEY="your_private_key"
  ```
* Callback endpoint: `https://yourdomain.com/api/payments/nagad/callback`

---

## 7. PostgreSQL Production Deployment (Vercel / Supabase / Neon / Railway)

To switch from local SQLite to managed PostgreSQL in production:
1. In `prisma/schema.prisma`, update the datasource:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Set your production database connection string in `.env`:
   ```env
   DATABASE_URL="postgresql://username:password@ep-host-123.ap-southeast-1.neon.tech/nexstep_prod?sslmode=require"
   ```
3. Run schema sync:
   ```bash
   npx prisma db push
   node scripts/seed.mjs
   ```
4. Build and deploy:
   ```bash
   npm run build
   npm run start
   ```

---

## 8. License & Support

Nexstep Gallery Platform Architecture is developed for **Nexstep Gallery Ltd**.
For technical inquiries or atelier integrations, contact `support@nexstepgallery.com`.
