#!/bin/bash

# ERP System Launcher
# Auto-detects Docker availability and uses PostgreSQL or SQLite accordingly

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}         ERP System Launcher            ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if Docker is available and running
if command -v docker &> /dev/null && docker info &> /dev/null 2>&1; then
    echo -e "${GREEN}[✓] Docker detected${NC}"
    MODE="docker"
else
    echo -e "${YELLOW}[!] Docker not running - using SQLite${NC}"
    MODE="sqlite"
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ "$MODE" = "docker" ]; then
    echo ""
    echo "Starting with PostgreSQL via Docker..."
    echo ""

    # Start PostgreSQL and Redis
    cd "$SCRIPT_DIR"
    docker compose up -d postgres redis

    # Wait for services to be ready
    echo "Waiting for database to be ready..."
    sleep 5

    # Set environment variables
    export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/erp"
    export REDIS_URL="redis://localhost:6379"
    export JWT_SECRET="dev-secret-change-in-production"
    export JWT_REFRESH_SECRET="dev-refresh-secret-change-in-production"
    export NODE_ENV="development"
    export PORT="3001"
    export CORS_ORIGIN="http://localhost:3000"

    # Setup and start backend
    echo ""
    echo "Setting up backend..."
    cd "$SCRIPT_DIR/backend"
    npm install
    npx prisma generate
    npx prisma migrate deploy
    echo ""
    echo "Starting backend server..."
    npm run start:dev &
    BACKEND_PID=$!
    cd "$SCRIPT_DIR"

    # Start frontend
    echo ""
    echo "Starting frontend..."
    cd "$SCRIPT_DIR/frontend"
    npm run dev &
    FRONTEND_PID=$!
    cd "$SCRIPT_DIR"

else
    echo ""
    echo "Starting with SQLite (no Docker required)..."
    echo ""

    # Set environment variables for SQLite
    export DATABASE_URL="file:./dev.db"
    export JWT_SECRET="dev-secret-change-in-production"
    export JWT_REFRESH_SECRET="dev-refresh-secret-change-in-production"
    export NODE_ENV="development"
    export PORT="3001"
    export CORS_ORIGIN="http://localhost:3000"

    # Setup and start backend
    echo ""
    echo "Setting up backend..."
    cd "$SCRIPT_DIR/backend"
    npm install
    npx prisma generate --schema=prisma/schema.sqlite
    npx prisma migrate dev --schema=prisma/schema.sqlite --name init
    echo ""
    echo "Starting backend server..."
    npm run start:dev &
    BACKEND_PID=$!
    cd "$SCRIPT_DIR"

    # Start frontend
    echo ""
    echo "Starting frontend..."
    cd "$SCRIPT_DIR/frontend"
    npm run dev &
    FRONTEND_PID=$!
    cd "$SCRIPT_DIR"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   All services starting...${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "   Backend:  ${GREEN}http://localhost:3001${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "   Health:   ${GREEN}http://localhost:3001/api/health${NC}"
echo ""

# Try to open browser
if command -v open &> /dev/null; then
    open "http://localhost:3000"  # macOS
elif command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:3000"  # Linux
fi

echo "   Press Ctrl+C to stop all services"
echo ""

# Wait for user to interrupt
trap "echo ''; echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; cd $SCRIPT_DIR && docker compose down 2>/dev/null; exit 0" INT TERM

wait
