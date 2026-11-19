# BeeNext — Handwritten DSA Learning & Notes Marketplace

> A modern, developer-focused marketplace for handwritten Data Structures and Algorithms (DSA) notes, high-resolution recursion blueprints, and verified Java solutions.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **PostgreSQL**, **Prisma ORM**, and **Razorpay**.

---

## 🎨 Design System & Strict Palette

BeeNext is styled exclusively using the following minimalist high-contrast developer palette:

- **Red:** `#E52532` — Primary buttons, accent indicators, badges, and focus rings
- **White:** `#FFFFFF` — Crisp typography, headers, and code characters
- **Black:** `#111111` — Engineering background, deep card elevations, dark graphite code blocks

---

## 🌟 Key Architecture & Features

### 1. 18 Comprehensive DSA Categories
1. **Sorting** — *(100% FREE for all visitors & registered users by business rule)*
2. Searching
3. Arrays
4. Strings
5. Linked List
6. Stack
7. Queue
8. Binary Trees
9. Binary Search Trees
10. Heaps
11. Hashing
12. Recursion
13. Backtracking
14. Greedy Algorithms
15. Dynamic Programming
16. Graphs
17. Tries
18. Bit Manipulation

### 2. Free vs. Premium Access Rules
- **Sorting Algorithms Track is 100% Free** forever: Quick Sort, Merge Sort, Bubble Sort, Selection Sort, Insertion Sort, Heap Sort, Counting Sort, and Radix Sort are unlocked for all users.
- **All other categories are Premium by default**: Premium problems display problem statements and preview descriptions, but Java solutions and high-resolution handwritten diagrams remain locked until purchased.
- **Three Purchase Modes**:
  - Individual Problem Pass (e.g., ₹49)
  - Category Topic Pass (e.g., ₹199 – ₹499)
  - All-Access Lifetime Bundle (₹1,499)

### 3. Comprehensive Problem Detail Pages
- **Section A. Problem Statement**: Description, Input & Output specifications, Constraints, Example Cases, Explanations.
- **Section B. LeetCode Integration**: "Solve on LeetCode" button opening the original LeetCode problem in a new tab.
- **Section C. Code Notes**: Two tabs — **Optimal Approach** and **Brute Force Approach**, with Java syntax, copy-to-clipboard, and Time/Space complexity badges.
- **Section D. Handwritten Notes**: Multi-page handwritten diagram viewer with zoom controls, fullscreen pan/zoom, thumbnail navigation, and PDF downloads.

### 4. Admin Content Management Dashboard (`/admin`)
- Accessible strictly to users with role `ADMIN`.
- **Metrics Overview**: Total registered users, total revenue, total purchases, free/premium category counts, recent transactions.
- **Category CRUD**: Create, edit pricing, toggle free/premium, reorder, delete.
- **Problem CRUD**: Add and edit problems, Java code, complexities, and LeetCode URLs.
- **Note & PDF Uploader**: Upload high-res SVG, PNG, JPG, and PDF notes with protection flags.
- **Orders & Transactions**: Real-time audit log of Razorpay payment IDs, amounts, and statuses.
- **User Management**: View users, join dates, and roles.

### 5. Secure Payment Integration (Razorpay)
- Backend order generation via Razorpay API.
- Cryptographic HMAC-SHA256 signature verification on `/api/payments/verify`.
- Webhook endpoint at `/api/payments/webhook` for async payment status updates.
- Test/Sandbox checkout simulation for development environments.

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Node.js >= 18.x (tested on Node v24)
- PostgreSQL database

### 1. Clone & Install Dependencies
```bash
cd beenext
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your PostgreSQL connection and secrets in `.env`:
```env
# Database Configuration (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/beenext_db?schema=public"

# App & Authentication
NEXT_PUBLIC_APP_URL="http://localhost:3000"
JWT_SECRET="beenext_super_secure_jwt_secret_production_ready_2026_xyz"
SESSION_COOKIE_NAME="beenext_token"

# Default Admin Credentials (Used by seed script)
ADMIN_NAME="BeeNext Administrator"
ADMIN_EMAIL="admin@beenext.dev"
ADMIN_PASSWORD="AdminSecurePassword123!"

# Razorpay Keys
RAZORPAY_KEY_ID="rzp_test_your_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
RAZORPAY_WEBHOOK_SECRET="your_razorpay_webhook_secret"
```

### 3. Initialize PostgreSQL & Apply Migrations
```bash
# Push schema to PostgreSQL
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

### 4. Seed the Database
```bash
npm run db:seed
```
This populates:
- Admin account (`admin@beenext.dev` / `AdminSecurePassword123!`)
- Demo user account (`alex@beenext.dev` / `UserSecurePassword123!`)
- All 18 DSA categories (Sorting set to Free)
- All 8 Sorting problems with Java brute force & optimal code, complexities, and multi-page SVG handwritten notes
- Premium problems (Two Sum, 0/1 Knapsack) with pricing and notes

### 5. Run the Application
```bash
# Development mode
npm run dev

# Production build & start
npm run build
npm run start
```
Visit `http://localhost:3000` in your browser.

---

## 🧪 Testing Major User Journeys

An automated end-to-end integration test suite is included in `prisma/test-journeys.js` and `prisma/test-upload.js`.

To run the verification suite:
```bash
# Ensure the server is running on port 3000
node prisma/test-journeys.js
node prisma/test-upload.js
```

### Verified User Journeys:
1. **Visitor opens free Sorting problem** — Quick Sort is 100% accessible to unauthenticated visitors with full Java code and notes.
2. **User opens premium problem** — 0/1 Knapsack is locked; Java code is masked and protected file URLs are withheld.
3. **User payment & access unlock** — User signs in, completes checkout via Razorpay, backend verifies signature, and access is immediately granted.
4. **Protected media route control** — Requesting `/api/media/note/[id]` without purchase returns `403 Forbidden`; requesting with verified purchase returns `200 OK`.
5. **Admin uploads note** — Admin uploads an SVG/PDF note to a problem; purchased user can immediately view it.
6. **Admin creates category & problem** — Admin creates a category and problem through the admin API and dashboard.

---

## 📁 Project Structure

```
beenext/
├── prisma/
│   ├── schema.prisma          # Database models (User, Category, Problem, Purchase, etc.)
│   ├── seed.ts                # Seed script for 18 categories, 8 sorting algorithms & admin
│   ├── generate-notes.js      # SVG handwritten diagram generator
│   └── test-journeys.js       # End-to-end user journey verification test suite
├── public/
│   └── notes/                 # Curated handwritten SVG diagrams & PDF notes
├── src/
│   ├── app/
│   │   ├── api/               # API routes (auth, categories, problems, payments, media)
│   │   ├── admin/             # Admin Dashboard (metrics, CRUD, uploads, orders)
│   │   ├── login/             # Login page with demo autofill
│   │   ├── register/          # User registration page
│   │   ├── profile/           # User profile, learning progress & receipts
│   │   ├── purchases/         # User purchased notes & passes vault
│   │   ├── topics/            # 18 DSA Categories index & Category detail pages
│   │   ├── problem/[slug]/    # Problem page (Problem, LeetCode, Code, Notes)
│   │   ├── globals.css        # Tailwind styling & graph paper background
│   │   └── layout.tsx         # Root layout with AuthProvider & Razorpay script
│   ├── components/            # Reusable components (Navbar, Footer, CodeViewer, NoteViewer, Modals)
│   ├── context/               # AuthContext & access permission hooks
│   └── lib/                   # Database client (prisma.ts), auth.ts, razorpay.ts, utils.ts
├── tailwind.config.ts         # Custom palette (#E52532, #FFFFFF, #111111)
├── tsconfig.json              # TypeScript configuration
└── package.json
```

---

## 🚢 Deployment Instructions

### Vercel / Railway / Render
1. Push this repository to GitHub/GitLab.
2. Set up a managed PostgreSQL database (e.g., Supabase, Neon, or Railway PostgreSQL).
3. Set the Environment Variables (`DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).
4. Set Build Command: `npx prisma db push && npx tsx prisma/seed.ts && npm run build`
5. Start Command: `npm run start`

---

## 🔒 Security Best Practices Implemented
- Passwords hashed using bcrypt (12 salt rounds).
- HTTP-Only `SameSite=Lax` secure session cookies.
- Server-side access verification on every protected resource and media download endpoint.
- HMAC-SHA256 signature verification for all payment transactions.
- Zero client trust on pricing (amounts are strictly computed server-side from PostgreSQL).
