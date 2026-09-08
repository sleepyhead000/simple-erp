# API Endpoints (MVP)

## Auth
- POST /auth/login
- POST /auth/register
- GET /auth/profile

## Products / Inventory
- GET /products
- POST /products
- GET /products/:id
- PATCH /products/:id
- DELETE /products/:id
- GET /inventory?store_id=
- POST /inventory/adjust
- GET /inventory/low-stock?store_id=

## Purchase Orders
- GET /purchase-orders
- POST /purchase-orders
- GET /purchase-orders/:id
- PATCH /purchase-orders/:id/receive
- PATCH /purchase-orders/:id/cancel

## Sales / POS
- POST /sales
- POST /sales/:id/refund
- GET /sales?store_id=&from=&to=

## Reporting
- GET /reports/inventory-turnover
- GET /reports/sales-summary

## Admin
- GET /admin/stores
- POST /admin/stores
- GET /admin/audit-logs

## Health
- GET /health
