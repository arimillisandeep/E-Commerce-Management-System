# E-Commerce Management System

A full-stack e-commerce web application built with **React.js**, **Node.js + Express.js**, and **PostgreSQL**. Users can register, log in, browse/search/filter products, manage a cart, place orders, and view order history. Admins get a dashboard to manage products, users, and orders with sales statistics.

![Tech Stack](https://img.shields.io/badge/stack-React%2018%20%7C%20Express%204%20%7C%20PostgreSQL-blue)

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites & Setup](#prerequisites--setup)
5. [Database Design & Relationships](#database-design--relationships)
6. [API Reference](#api-reference)
7. [How to Run](#how-to-run)
8. [Complete Project Workflow](#complete-project-workflow)
9. [Security Measures](#security-measures)
10. [Interview Questions & Answers](#interview-questions--answers)
11. [2-Minute Project Explanation](#2-minute-project-explanation)
12. [Resume Project Description](#resume-project-description)
13. [Deployment Steps](#deployment-steps)
14. [Common Errors & Fixes](#common-errors--fixes)

---

## Features

**User features**
- Register / login (JWT, bcrypt-hashed passwords)
- User profile (view + update name/password)
- Browse all products with pagination
- Search, category filter, price-range filter, sorting
- Product details page
- Cart: add, update quantity, remove, subtotal/total
- Checkout: place order (transactional, stock decrement)
- Order history + order details
- Logout

**Admin features**
- Admin-only login gate (role check on every admin route)
- Dashboard with revenue / orders / pending / products / customers stats
- Products CRUD
- Orders list, detail, status updates (pending → processing → shipped → delivered / cancelled)
- View all registered users

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, Axios, Vite, CSS |
| Backend | Node.js 22, Express 4 |
| Database | PostgreSQL (pg / node-postgres) |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Validation | express-validator |
| Security | helmet, cors |

---

## Project Structure

```
E-Commerce Management System/
├── database/
│   ├── schema.sql          # DDL: users, products, carts, cart_items, orders, order_items
│   └── seed.sql            # Sample data
├── server/
│   ├── config/db.js        # PostgreSQL connection pool
│   ├── controllers/        # auth, user, product, cart, order, admin
│   ├── middleware/         # auth, admin, validate, errorHandler, asyncHandler
│   ├── models/             # user, product, cart, order (SQL queries)
│   ├── routes/             # REST route definitions
│   ├── utils/              # jwt helpers, validators
│   ├── app.js              # Express app setup
│   └── server.js           # Entry point
└── client/
    └── src/
        ├── components/     # Navbar, ProductCard, ProductFilters, routes guards, states
        ├── pages/          # Home, Login, Register, Products, Cart, Checkout, Orders, Admin...
        ├── services/api.js # Axios instance with interceptors
        ├── context/        # AuthContext, CartContext (Context API)
        ├── hooks/          # useDebounce
        ├── utils/          # helpers
        ├── App.jsx         # Router configuration
        └── main.jsx        # React entry
```

---

## Prerequisites & Setup

1. **Node.js 18+** — https://nodejs.org
2. **PostgreSQL 14+** — https://postgresql.org

```bash
# Clone / open the project folder
cd "E-Commerce Management System"

# Install everything (server + client)
npm run install:all
```

**Configure the server** — copy `server/.env.example` to `server/.env` and fill in your database credentials:

```bash
cp server/.env.example server/.env
```

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=ecommerce_db
JWT_SECRET=a_long_random_string_here
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
CLIENT_URL=http://localhost:5173
```

**Create the database and schema:**

```bash
createdb ecommerce_db
psql -U postgres -d ecommerce_db -f database/schema.sql
psql -U postgres -d ecommerce_db -f database/seed.sql
```

> The seed file ships with placeholder hashes. Generate real ones with:
> `node -e "console.log(require('bcryptjs').hashSync('admin123',10))"` then replace the `password_hash` values (or register through the API/UI).

---

## Database Design & Relationships

### Tables

| Table | Purpose |
|---|---|
| `users` | Accounts for customers and admins (`role` column) |
| `products` | Catalog items with price, stock, category |
| `carts` | One cart per user (1:1 with `users`) |
| `cart_items` | Line items inside a cart (product × quantity) |
| `orders` | Placed orders with status + total |
| `order_items` | Line items inside an order (price snapshot) |

### Relationships

```
users 1──1 carts          (carts.user_id UNIQUE → users.id, CASCADE)
users 1──∞ orders         (orders.user_id → users.id, CASCADE)
carts 1──∞ cart_items     (cart_items.cart_id → carts.id, CASCADE)
products 1──∞ cart_items  (cart_items.product_id → products.id, CASCADE)
orders 1──∞ order_items   (order_items.order_id → orders.id, CASCADE)
products 1──∞ order_items (order_items.product_id → products.id)
```

**Key design decisions**
- `cart_items` has `UNIQUE(cart_id, product_id)` — one row per product, quantity updated in place (`ON CONFLICT ... DO UPDATE`).
- `order_items` stores `product_name` + `unit_price` as a **snapshot**, so order history survives product edits/deletes.
- `price`/`total_amount` use `NUMERIC(10,2)` — exact decimal money math (never float).
- `CHECK` constraints enforce valid prices, stock, roles, and order statuses at the DB level.
- Placing an order runs in a **transaction**: insert order → insert order_items → decrement stock (`WHERE stock >= qty`) → clear cart → COMMIT. Any failure rolls back everything.

---

## API Reference

Base URL: `http://localhost:5000/api`

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create account, returns JWT |
| POST | `/api/auth/login` | Public | Verify credentials, returns JWT |
| GET | `/api/auth/me` | Auth | Current user from token |

### Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/users/profile` | Auth | Get profile |
| PATCH | `/api/users/profile` | Auth | Update name / password |

### Products
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/products` | Public | List with `search`, `category`, `minPrice`, `maxPrice`, `sort`, `page`, `limit` |
| GET | `/api/products/categories` | Public | Distinct categories |
| GET | `/api/products/:id` | Public | Product details |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |

### Cart
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/cart` | Auth | Cart with items + subtotal |
| POST | `/api/cart/items` | Auth | Add `{product_id, quantity}` |
| PUT | `/api/cart/items/:cartItemId` | Auth | Set exact quantity |
| DELETE | `/api/cart/items/:cartItemId` | Auth | Remove item |

### Orders
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/orders` | Auth | My order history (paginated) |
| GET | `/api/orders/:id` | Auth | My order details |
| POST | `/api/orders` | Auth | Place order from cart |

### Admin
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/admin/stats` | Admin | Dashboard statistics |
| GET | `/api/admin/users` | Admin | List registered users |
| GET | `/api/admin/orders` | Admin | All orders (`status` filter, pagination) |
| GET | `/api/admin/orders/:id` | Admin | Order detail with customer |
| PATCH | `/api/admin/orders/:id/status` | Admin | Update order status |
| POST | `/api/admin/products` | Admin | Create product |
| PUT | `/api/admin/products/:id` | Admin | Update product |
| DELETE | `/api/admin/products/:id` | Admin | Delete product |

**Auth header format:** `Authorization: Bearer <token>`

**Standard error response:** `{ "status": "error", "message": "..." }` (400 validation, 401 auth, 403 forbidden, 404 not found, 409 duplicate, 500 server)

---

## How to Run

```bash
# Terminal 1 — backend (with hot reload)
npm run server
# Expected: "PostgreSQL connected: <timestamp>" + "Server running on http://localhost:5000"

# Terminal 2 — frontend (with hot reload)
npm run client
# Expected: "Local: http://localhost:5173/"

# Or run both at once:
npm run dev
```

Open **http://localhost:5173**. Test accounts: register via UI, or use the admin seed (`admin@example.com` / `admin123` after regenerating the hash).

---

## Complete Project Workflow

1. User registers → password hashed with **bcrypt** → account stored → JWT issued.
2. User logs in → credentials verified against hash → JWT stored in `localStorage` → sent as Bearer token on every API call.
3. User browses `/products` → API applies search/filter/sort SQL (`ILIKE`, `WHERE`, `ORDER BY`, `LIMIT/OFFSET`).
4. User clicks a product → `/products/:id` shows details, quantity picker, Add to Cart.
5. Cart API does `INSERT ... ON CONFLICT DO UPDATE` (upsert) so duplicates merge into one row.
6. Checkout → POST `/orders` runs a **transaction**: order + order_items created, product stock decremented, cart cleared.
7. Order history shows placed orders; order detail shows items with the price snapshot.
8. Admin logs in → role check (`req.user.role === 'admin'`) unlocks `/admin/*` routes → manages products/users/orders, sees revenue stats.

---

## Security Measures

- Passwords hashed with **bcrypt** (salt rounds configurable); plaintext never stored.
- **JWT** authentication; protected routes verify the signature + expiry server-side.
- Admin routes additionally require `role === 'admin'` (403 otherwise).
- All input validated server-side with **express-validator** (never trust the client).
- **Helmet** sets security HTTP headers; **CORS** restricted to the configured client origin.
- Secrets in `.env` (git-ignored) — no credentials in code.
- Parameterized SQL queries everywhere → no SQL injection.
- Central error handler never leaks stack traces to clients.

---

## Interview Questions & Answers

**1. Why bcrypt and not MD5/SHA?**
bcrypt is deliberately slow and salted, making brute-force/rainbow-table attacks impractical. Fast hashes like MD5 are insecure for passwords.

**2. How does JWT work here?**
On login the server signs `{id, role, email}` with `JWT_SECRET`. The client sends it in the `Authorization` header. Middleware verifies the signature and expiry; the payload identifies the user and their role.

**3. How do you protect admin routes?**
Two layers: `requireAuth` verifies the JWT, then `requireAdmin` checks `req.user.role === 'admin'` and returns 403 otherwise. The frontend also hides admin links and guards `/admin/*` routes.

**4. How is placing an order kept consistent?**
A PostgreSQL transaction (`BEGIN` → inserts → `COMMIT`). Stock is decremented with `WHERE stock >= quantity`; if any product is short, the whole transaction rolls back so the cart and inventory stay consistent.

**5. Why store `unit_price` and `product_name` in `order_items`?**
Price snapshot: the product may be edited or deleted later, but the order must still show what the customer actually paid.

**6. How does search/filter/sort work safely?**
Filters build a parameterized `WHERE` clause (`ILIKE` for search, `=` for category, `>=`/`<=` for price); sorting maps user input to a whitelist of `ORDER BY` columns, so user input never becomes raw SQL.

**7. Why a connection pool instead of one connection?**
A pool reuses connections across concurrent requests, avoiding the cost of reconnecting per request and bounding database load (`max: 20`).

**8. Why is `price` a NUMERIC and not a FLOAT?**
Floats have binary rounding errors — unacceptable for money. NUMERIC stores exact decimal values.

**9. What does the `UNIQUE(cart_id, product_id)` constraint give us?**
One row per product per cart, enabling an atomic upsert (`ON CONFLICT DO UPDATE`) that increments quantity without race conditions.

**10. What status codes do you return and when?**
200 success, 201 created, 400 validation, 401 no/invalid token, 403 non-admin, 404 not found, 409 duplicate email, 500 unexpected.

**11. How does the frontend handle an expired token?**
The Axios response interceptor catches 401, clears `localStorage`, and redirects to `/login`.

**12. Why Context API here?**
Auth (user/token) and cart state are genuinely global; Context avoids prop-drilling through every page. It's simple and dependency-free — Redux would be overkill at this scale.

---

## 2-Minute Project Explanation

> "This is a full-stack e-commerce app. The backend is Node.js + Express exposing a REST API over PostgreSQL, organized into routes, controllers, models, and middleware. Authentication uses JWT with bcrypt-hashed passwords; every protected route verifies the token, and admin routes additionally check the user's role. Products support search, category/price filtering, sorting, and pagination — all built with parameterized SQL. Each user has a cart with line items; adding a product uses an upsert so duplicates merge. Placing an order runs a database transaction that copies the cart into an order with a price snapshot, decrements stock safely, and clears the cart. The frontend is React 18 with React Router, Context API for auth and cart state, and Axios with interceptors for token attachment and global error handling. It includes protected and admin-only routes, loading/error/empty states, and a responsive CSS layout. The admin panel provides a stats dashboard, product CRUD, order management with status updates, and a user list. I verified the backend with syntax checks and the frontend with a production Vite build, and the server fails fast with a clear message if the database is unreachable."

---

## Resume Project Description

> **E-Commerce Management System** — Full-stack web app (React, Node.js/Express, PostgreSQL, REST API).
> Implemented JWT authentication with bcrypt password hashing and role-based admin authorization; built product catalog with search, filtering, sorting, and pagination; designed a transactional checkout flow (cart → order with price snapshots + atomic stock decrement); created an admin dashboard with sales statistics, product CRUD, order status management, and user management; enforced input validation, centralized error handling, CORS/Helmet security, and responsive UI with loading/error/empty states.

---

## Deployment Steps

**Backend (e.g. Render / Railway / VPS)**
1. Create a PostgreSQL database (Render, Supabase, Neon, or a VPS).
2. Set environment variables (`DB_*`, `JWT_SECRET`, `CLIENT_URL`, `PORT`).
3. Run `database/schema.sql` (and optionally `seed.sql`) against the DB.
4. `npm --prefix server install --omit=dev` then `npm --prefix server start`.

**Frontend (e.g. Vercel / Netlify)**
1. `cd client` → set `VITE_API_URL` to the deployed API URL.
2. `npm install && npm run build`, deploy the `dist/` folder.

**Production checklist**
- Generate a strong `JWT_SECRET` (32+ random chars).
- Restrict `CLIENT_URL` to your real domain.
- Use HTTPS everywhere.
- Set `NODE_ENV=production`.
- Add a DB connection limit appropriate for your plan.

---

## Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `ERROR: Could not connect to PostgreSQL` | Wrong `DB_*` env or Postgres not running | Start Postgres, verify credentials in `server/.env` |
| `role "..." does not exist` | `DB_USER` wrong | Set `DB_USER=postgres` (or your role name) |
| `Invalid or expired token` | Token expired / removed | Log in again |
| `Forbidden: admin access required` | Non-admin hitting admin route | Use an admin account (`role='admin'`) |
| `Email already registered` (409) | Duplicate signup | Log in instead |
| `Insufficient stock` (400) | Someone bought the last units | Reduce quantity |
| CORS error in browser | `CLIENT_URL` mismatch | Set `CLIENT_URL` to the exact frontend origin |
| `EADDRINUSE :5000` | Port busy | Change `PORT` in `server/.env` |
| Vite build fails on import | Missing dependency | `npm --prefix client install` |
| Product images blank/broken | Seed URLs need internet (picsum.photos) | Offline? Images show a labeled placeholder automatically; or paste your own `image_url` values |
| Cart shows empty after adding | Must be logged in; cart is per-user | Log in first; the Cart page re-fetches fresh data on open |

---

**License:** MIT — free to use for learning and portfolios.
