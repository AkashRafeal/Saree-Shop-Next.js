# SareeAura | Luxury Indian Saree E-Commerce Platform

SareeAura is a luxury Indian fashion and saree e-commerce platform built as a **Fullstack Next.js 14** application (App Router, TypeScript, Tailwind CSS, Prisma ORM, MySQL 8).

---

## Architecture Overview
- **Framework**: Next.js 14 (App Router)
- **Frontend**: React 18, TypeScript, Tailwind CSS, TanStack Query, Zustand, Lucide React, Framer Motion, Recharts, GSAP
- **Backend**: Native Next.js 14 API Route Handlers (`src/app/api/...`)
- **Database / ORM**: MySQL 8.0 with Prisma ORM
- **Authentication**: JWT token issuance & verification with `bcryptjs` password hashing
- **Payment**: Razorpay (Test Mode & Sandbox)
- **Media**: Local `/uploads/` and Cloudinary support

---

## Running the Project

### Prerequisites
- Node.js 20+ & npm
- MySQL 8.0 (running locally on port 3306 or via Docker)

### 1. Database Setup
Ensure MySQL is running and your `.env` contains the database connection string:
```env
DATABASE_URL="mysql://root:root@localhost:3306/sareeaura_db"
```

### 2. Install & Generate
```bash
npm install
npx prisma generate
```

### 3. Run Development Server
```bash
npm run dev
```
- Web Application & API: `http://localhost:3000`
- Storefront: `http://localhost:3000`
- Admin Dashboard: `http://localhost:3000/admin`
- Health Check: `http://localhost:3000/api/health`

### 4. Production Build
```bash
npm run build
npm run start
```

---

## Seed Accounts
- **Admin**: `admin@nivicouture.com` / `Admin@123`
- **Customer**: `customer@sareeaura.com` / `Customer@123`
