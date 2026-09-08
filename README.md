# Simple ERP

A full-stack ERP system for retail businesses — manage inventory, process sales, handle purchase orders, and track stock across multiple stores.

## Features

- **Dashboard** — real-time metrics for products, stock levels, sales, and orders
- **Product Catalog** — CRUD with SKU, categories, pricing, and search
- **Inventory Management** — stock levels per store with low-stock alerts
- **Sales** — create transactions, process refunds, multiple payment methods
- **Purchase Orders** — order from suppliers, receive stock, auto-update inventory
- **Multi-Store** — manage multiple store locations with store-level data
- **User Management** — role-based access (admin, manager, cashier, staff)
- **Onboarding Tutorial** — step-by-step guide for new users
- **Responsive Design** — works on desktop and mobile

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS (TypeScript) |
| Frontend | Next.js 14 (React) + Tailwind CSS + shadcn/ui |
| Database | PostgreSQL (prod) / SQLite (local) |
| ORM | Prisma |
| Auth | JWT + bcrypt + RBAC |
| State | Zustand + React Query |
| Icons | Lucide React |
| Notifications | Sonner (toast) |

## Quick Start

### Prerequisites

- Node.js 18+
- npm
- Docker & Docker Compose (optional — for PostgreSQL)

### One-Click Launch

**Windows:**
```batch
launch.bat
```

**Mac/Linux:**
```bash
chmod +x launch.sh
./launch.sh
```

The launcher auto-detects Docker. If available, uses PostgreSQL. Otherwise, falls back to SQLite.

### Manual Setup

**Backend (SQLite — no Docker needed):**
```bash
cd backend
cp .env.example .env
npm install
npx prisma generate --schema=prisma/schema.sqlite
npx prisma db push --schema=prisma/schema.sqlite
npm run start:dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Default Credentials

| Field | Value |
|-------|-------|
| Email | `admin@gmail.com` |
| Password | `admin123` |

> The admin user is created automatically on first backend startup.

### Access

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001/api |
| Health Check | http://localhost:3001/api/health |

## Docker

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Login (rate-limited: 5/min) |
| POST | `/api/auth/register` | Admin | Create user |
| GET | `/api/auth/profile` | JWT | Current user |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | JWT | List (search, filter, paginate) |
| GET | `/api/products/:id` | JWT | Single product |
| POST | `/api/products` | Manager+ | Create |
| PATCH | `/api/products/:id` | Manager+ | Update |
| DELETE | `/api/products/:id` | Admin | Delete |

### Inventory
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/inventory` | JWT | List stock levels |
| POST | `/api/inventory/adjust` | Manager+ | Adjust quantity (prevents negative) |
| GET | `/api/inventory/low-stock` | JWT | Low stock items |

### Purchase Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/purchase-orders` | JWT | List orders |
| GET | `/api/purchase-orders/:id` | JWT | Order detail |
| POST | `/api/purchase-orders` | Manager+ | Create order |
| PATCH | `/api/purchase-orders/:id/receive` | Manager+ | Mark received |
| PATCH | `/api/purchase-orders/:id/cancel` | Manager+ | Cancel order |

### Sales
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/sales` | JWT | List transactions |
| GET | `/api/sales/:id` | JWT | Transaction detail |
| POST | `/api/sales` | Cashier+ | Create sale |
| POST | `/api/sales/:id/refund` | Manager+ | Process refund |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stores` | Admin | List stores |
| POST | `/api/admin/stores` | Admin | Create store |
| PATCH | `/api/admin/stores/:id` | Admin | Update store |
| DELETE | `/api/admin/stores/:id` | Admin | Delete store |
| GET | `/api/admin/audit-logs` | Admin | Audit trail |

### Reports
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reports/sales-summary` | JWT | Revenue breakdown |
| GET | `/api/reports/inventory-turnover` | JWT | Stock levels |

## Security

- **Rate limiting** — global 100 req/min, login 5 req/min
- **JWT auth** — 15-minute expiry, cryptographically random secret
- **RBAC** — 4 roles: admin, manager, cashier, staff
- **Input validation** — class-validator DTOs on all endpoints
- **Stock protection** — prevents negative inventory adjustments
- **Audit logging** — stock mutations are tracked

## Database Schema

| Table | Purpose |
|-------|---------|
| `stores` | Multi-store locations |
| `users` | User accounts with roles |
| `products` | Product catalog (SKU, price, cost) |
| `inventory` | Stock levels per store |
| `purchase_orders` | Supplier orders |
| `purchase_order_items` | Line items for POs |
| `sales_transactions` | POS transactions |
| `sales_transaction_items` | Line items for sales |
| `audit_log` | Mutation audit trail |

## Project Structure

```
simple-erp/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # PostgreSQL schema
│   │   └── schema.sqlite        # SQLite schema
│   └── src/
│       ├── auth/                 # JWT, login, register, guards
│       ├── users/                # User CRUD
│       ├── products/             # Product CRUD
│       ├── inventory/            # Stock management
│       ├── purchase-orders/      # PO management
│       ├── sales/                # Sales + refunds
│       ├── reporting/            # Analytics endpoints
│       ├── admin/                # Stores, audit logs
│       ├── seed/                 # Auto-seed admin user
│       └── prisma/               # Prisma service
├── frontend/
│   └── src/
│       ├── app/                  # Next.js pages
│       │   ├── page.tsx          # Dashboard
│       │   ├── login/            # Login
│       │   ├── products/         # Products list
│       │   ├── inventory/        # Inventory
│       │   ├── sales/            # Sales
│       │   ├── purchase-orders/  # POs
│       │   ├── reports/          # Reports
│       │   └── admin/            # Stores + Users
│       ├── components/
│       │   ├── layout/           # AppShell, Sidebar, PageHeader
│       │   ├── tutorial/         # Onboarding tutorial
│       │   └── ui/               # shadcn/ui components
│       ├── lib/                  # API client, utils
│       └── store/                # Zustand stores
├── docker-compose.yml
├── launch.bat                    # Windows launcher
└── launch.sh                     # Mac/Linux launcher
```

## Development

**Backend:**
```bash
cd backend
npm run start:dev    # Watch mode
npm run build        # Build
npm run lint         # Lint
```

**Frontend:**
```bash
cd frontend
npm run dev          # Dev server
npm run build        # Build
npm run lint         # Lint
```

## License

[MIT](LICENSE)
