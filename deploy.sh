#!/bin/bash
# ==================== PaiNamNae Deployment Script ====================
# รันสคริปต์นี้บน server หลังจาก upload code แล้ว

set -e

echo "=========================================="
echo "  PaiNamNae WebApp Deployment"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Install dependencies
echo -e "${YELLOW}[1/6] Installing Backend Dependencies...${NC}"
cd backend
npm install --production
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Step 2: Generate Prisma Client
echo -e "${YELLOW}[2/6] Generating Prisma Client...${NC}"
npx prisma generate
echo -e "${GREEN}✓ Prisma client generated${NC}"

# Step 3: Run Database Migrations
echo -e "${YELLOW}[3/6] Running Database Migrations...${NC}"
npx prisma migrate deploy
echo -e "${GREEN}✓ Database migrations applied${NC}"

# Step 4: Seed Admin User (if needed)
echo -e "${YELLOW}[4/6] Seeding Database...${NC}"
npm run seed || echo "Seed might have already run"
echo -e "${GREEN}✓ Database seeded${NC}"

cd ..

# Step 5: Build Frontend
echo -e "${YELLOW}[5/6] Building Frontend...${NC}"
cd frontend
npm install
npm run build
echo -e "${GREEN}✓ Frontend built${NC}"

cd ..

# Step 6: Start/Restart PM2
echo -e "${YELLOW}[6/6] Starting Applications with PM2...${NC}"
pm2 delete painamnae-backend painamnae-frontend 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save
echo -e "${GREEN}✓ Applications started${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}  Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Backend running on: http://localhost:3000"
echo "Frontend running on: http://localhost:3001"
echo ""
echo "PM2 Commands:"
echo "  pm2 status          - Check status"
echo "  pm2 logs            - View logs"
echo "  pm2 restart all     - Restart all apps"
echo ""
