# SareeAura | Luxury Indian Saree E-Commerce Platform

SareeAura is a luxury Indian fashion and saree e-commerce platform built using a **Modular Monolith** architecture with Next.js 14 (App Router, TypeScript, Tailwind CSS), Spring Boot 3 (Java 21), and MySQL 8.

---

## Architecture Overview
- **Frontend**: Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, TanStack Query, Zustand, Lucide React, Framer Motion, Recharts, GSAP.
- **Backend**: Java 21, Spring Boot 3.3.3, Spring Data JPA, Hibernate, Spring Security 6, JWT, Lombok, Swagger/OpenAPI.
- **Database**: MySQL 8.0 with transactional guarantees and audit trails.
- **Payment**: Razorpay (Test Mode & Sandbox).
- **Media**: Cloudinary & Local Static Uploads.

---

## Running the Project

### Prerequisites
- Java 21 LTS
- Apache Maven 3.9+
- Node.js 20+ & npm
- MySQL 8.0

### 1. Database Setup
```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend Setup
```bash
cd backend
mvn clean spring-boot:run
```
- API Base URL: `http://localhost:8080`
- Swagger UI Documentation: `http://localhost:8080/swagger-ui.html`
- Health Check: `http://localhost:8080/api/health`

### 3. Frontend Setup (Next.js)
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:3000`
- Production Build: `npm run build && npm run start`
