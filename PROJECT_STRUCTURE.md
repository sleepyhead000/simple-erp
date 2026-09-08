# Project Structure

```
/erp
  /backend
    /src
      /modules
        /auth           # JWT, login, register, guards
        /users          # User CRUD
        /products       # Product catalog
        /inventory      # Stock levels, adjustments
        /purchase-orders # PO lifecycle
        /sales          # Transactions, refunds
        /reporting      # SQL aggregations
        /admin          # Stores, audit logs
        /health         # Health check endpoint
      /prisma           # Prisma schema, migrations
      app.module.ts
      main.ts
    Dockerfile
    package.json

  /frontend
    /src
      /app              # Next.js App Router pages
      /components       # React components
      /lib              # API client, utilities
      /store            # Zustand stores
    Dockerfile
    package.json

  /infra
    docker-compose.yml

  .env.example
  .gitignore
  README.md
```

## .env.example
```
DATABASE_URL=postgresql://user:pass@localhost:5432/erp
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000
```
