# NiVi Collections Architecture Specification

## 1. Overview
NiVi Collections is a luxury Indian Saree e-commerce platform built as a **Fullstack Next.js 14** application.
- **Framework**: Next.js 14 (App Router) with React 18, TypeScript, and Tailwind CSS.
- **Backend**: Native Next.js App Router API Route Handlers (`src/app/api/...`).
- **Database & ORM**: MySQL 8.0 with Prisma ORM for type-safe data access.
- **State Management**: TanStack Query (server-state caching) and Zustand (client UI badges/auth).
- **Security**: JWT token generation and verification with `bcryptjs` password encryption.

## 2. Directory Structure

```
d:/Saree Shop - Copy/
├── prisma/
│   └── schema.prisma        # Database models, enums, relations
├── public/
│   └── uploads/             # Saree imagery and uploaded assets
├── src/
│   ├── app/
│   │   ├── (auth)/          # Customer authentication pages (login, register)
│   │   ├── (storefront)/    # Public customer pages (shop, product, cart, orders)
│   │   ├── admin/           # Admin dashboard & management interfaces
│   │   └── api/             # Native Next.js 14 API Route Handlers
│   │       ├── auth/        # Login, register, me
│   │       ├── products/    # Product catalog, filters, curated collections
│   │       ├── categories/  # Category hierarchy
│   │       ├── cart/        # Shopping cart operations
│   │       ├── wishlist/    # Wishlist operations
│   │       ├── orders/      # Orders and status cancellation
│   │       ├── coupons/     # Coupon validation and listings
│   │       ├── reviews/     # Customer reviews and moderation
│   │       ├── banners/     # Promotional hero banners
│   │       ├── admin/       # Dashboard KPI analytics, CRUD operations
│   │       ├── upload/      # Multipart file uploads
│   │       └── health/      # Service healthcheck
│   ├── components/          # Reusable UI, layout, and storefront components
│   ├── lib/
│   │   ├── prisma.ts        # Prisma Client singleton
│   │   ├── auth.ts          # JWT and password encryption helpers
│   │   ├── api-response.ts  # Standardized API response format
│   │   └── serializers.ts   # Model to DTO serialization
│   ├── services/            # Client API services
│   └── types/               # TypeScript interfaces and declarations
└── Dockerfile               # Production multi-stage Next.js Dockerfile
```
