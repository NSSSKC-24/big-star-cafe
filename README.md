# The Big Star Cafe — Dynamic Cafe Website

This is a database-backed dynamic cafe website for **The Big Star Cafe, Hyderabad**.
The content is currently demo/imaginary so you can replace it later with scraped or verified cafe data.

## What this project includes

- Dynamic homepage powered by database data
- Public menu with search and category filtering
- QR table ordering flow using URLs like `/order?table=1`
- Cart and order placement
- Backend API for creating orders
- Admin login
- Admin dashboard with order statistics
- Admin order management
- Admin menu management
- SQLite local database using Prisma ORM

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite for local development

## Setup

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Open:

```text
http://localhost:3000
```

Admin login:

```text
URL: http://localhost:3000/admin/login
Email: admin@bigstarcafe.local
Password: admin123
```

## Important pages

```text
/                  Public dynamic homepage
/menu              Public searchable menu
/order?table=1     QR ordering page for table 1
/admin             Admin dashboard
/admin/menu        Menu management
/admin/orders      Order management
```

## How to create QR codes later

Generate one QR code per table:

```text
https://your-domain.com/order?table=1
https://your-domain.com/order?table=2
https://your-domain.com/order?table=3
```

Each QR opens the same ordering system but with a different table number.

## Production notes

This project uses simple demo admin authentication to keep the final-project flow easy to understand.
Before real cafe deployment, replace it with one of these:

- Supabase Auth
- NextAuth/Auth.js
- Clerk

Also move from SQLite to PostgreSQL for production.
# BIGSTAR
# BIGSTAR
