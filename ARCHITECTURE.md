# System Architecture

## 1. High-Level Diagram

```
[Next.js Frontend]
   |  REST + WebSocket (real-time stock/dashboard)
   v
[API Gateway / Backend (NestJS)]
   |-- Auth Service (JWT, RBAC)
   |-- Inventory Service
   |-- POS/Sales Service
   |-- Ops/Staff Service
   |-- Reporting Service
   |-- Job Queue (Redis + BullMQ) --> async: reports, sync
   v
[PostgreSQL]
```

## 2. Service Boundaries
- **Auth Service**: login, token refresh, RBAC policy checks
- **Inventory Service**: SKUs, stock levels, POs, transfers
- **POS Service**: transactions, refunds, payment gateway calls
- **Ops Service**: scheduling, checklists
- **Reporting Service**: aggregation queries, scheduled report jobs

## 3. Frontend Architecture
- Next.js App Router
- State: server state via React Query/TanStack Query; client/UI state via Zustand
- Tailwind for styling, component library (shadcn/ui recommended)
- Role-based route guards

## 4. Deployment
- Dockerized services, docker-compose for local dev
- CI: lint/test/build on PR, CD to staging/prod on merge
- Environments: dev, staging, prod (separate DBs)
- Secrets via environment variables / secret manager

## 5. Security Notes
- RBAC enforced at API layer, not just UI
- Rate limiting on API endpoints (cost control)
- Audit log table for inventory/financial mutations
- Encrypt PII at rest if customer data stored
