# Product Requirements Document
## Custom Retail & Service Management ERP

### 1. Overview
A modular ERP for physical retail businesses covering inventory, POS/operations, staff workflows, and automated reporting.

### 2. Goals
- Centralize inventory, sales, and operations data in one system.
- Reduce manual stock reconciliation and reporting effort.
- Support multi-location/multi-store expansion from day one.

### 3. Primary Users
- Store staff (POS, stock intake/counts)
- Store/ops managers (dashboards, reports, approvals)
- Admin/owner (multi-store view, finance)
- (Optional) Customers (loyalty, order status)

### 4. Core Modules

**4.1 Inventory Management**
- SKU/variant catalog, barcode support
- Multi-warehouse/multi-store stock levels
- Purchase orders, receiving, stock transfers
- Low-stock alerts, reorder point automation

**4.2 POS / Sales**
- Sale transactions, returns/refunds, discounts, taxes
- Payment integration (Stripe/local gateway)

**4.3 Operations & Staff**
- Shift scheduling, staff roles/permissions
- Task/checklist workflows (opening/closing, audits)

**4.4 Reporting & Dashboards**
- Sales, inventory turnover, margin, staff performance
- Real-time dashboard widgets with drill-down
- SQL-based analytics

**4.5 Admin/Settings**
- Multi-tenant/multi-store config
- Role-based access control (RBAC)
- Audit logs

### 5. Non-Functional Requirements
- Auth: JWT/session + RBAC, SSO optional later
- Data isolation per store/tenant
- Response time: <300ms for standard API calls
- Availability target: 99.5%
- Auditability: all inventory/financial mutations logged
- GDPR/local data regulation compliance if customer PII stored

### 6. Tech Stack
| Layer | Choice |
|---|---|
| Frontend | Next.js (React), Tailwind CSS, Zustand for state |
| Backend | Node.js (NestJS) |
| Primary DB | PostgreSQL |
| Auth | JWT + refresh tokens, RBAC middleware |
| Infra | Docker, CI/CD (GitHub Actions), cloud host (AWS/GCP/Render) |
| Queue/Jobs | Redis + BullMQ (for async tasks, reports) |

### 7. Phased Roadmap
- **Phase 1 (MVP):** Inventory + POS + basic dashboard, single store
- **Phase 2:** Multi-store, staff/ops module, RBAC
- **Phase 3:** Advanced reporting, forecasting
- **Phase 4:** Offline POS, customer-facing features

### 8. Open Questions
- Single-tenant vs multi-tenant DB architecture?
- Which POS hardware/peripherals need support (barcode scanners, receipt printers)?
- Expected store count / transaction volume (affects DB and infra sizing)?

### 9. Success Metrics
- Reduction in stock discrepancy rate
- Time saved on manual reporting
- User adoption rate among managers
