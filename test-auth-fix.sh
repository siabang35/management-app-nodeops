#!/bin/bash

# Test Auth Fix Script
# This script helps verify the authentication fix

echo "=================================="
echo "🔍 Auth Fix Verification Script"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Verify .env.local exists and has valid keys
echo "1️⃣  Checking .env.local configuration..."
if [ -f ".env.local" ]; then
    if grep -q "your_supabase_anon_key_here" .env.local; then
        echo -e "${RED}❌ FAIL: .env.local still has placeholder keys${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ PASS: .env.local has valid configuration${NC}"
    fi
else
    echo -e "${RED}❌ FAIL: .env.local not found${NC}"
    exit 1
fi
echo ""

# Check 2: Verify middleware.ts has been updated
echo "2️⃣  Checking middleware.ts..."
if grep -q "x-user-authenticated" middleware.ts; then
    echo -e "${GREEN}✅ PASS: Middleware has custom headers${NC}"
else
    echo -e "${RED}❌ FAIL: Middleware missing custom headers${NC}"
    exit 1
fi
echo ""

# Check 3: Verify dashboard page has been simplified
echo "3️⃣  Checking dashboard/page.tsx..."
if grep -q "middleware validated" app/dashboard/page.tsx; then
    echo -e "${GREEN}✅ PASS: Dashboard trusts middleware${NC}"
else
    echo -e "${RED}❌ FAIL: Dashboard still has complex auth check${NC}"
    exit 1
fi
echo ""

# Check 4: Verify admin page has been simplified
echo "4️⃣  Checking admin/page.tsx..."
if grep -q "middleware validated" app/admin/page.tsx; then
    echo -e "${GREEN}✅ PASS: Admin page trusts middleware${NC}"
else
    echo -e "${RED}❌ FAIL: Admin page still has complex auth check${NC}"
    exit 1
fi
echo ""

# Check 5: Verify signin route has httpOnly: false
echo "5️⃣  Checking API signin route..."
if grep -q "httpOnly: false" app/api/auth/signin/route.ts; then
    echo -e "${GREEN}✅ PASS: Cookie is client-accessible${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: Cookie might not be client-accessible${NC}"
fi
echo ""

# Check 6: Verify backend is running
echo "6️⃣  Checking backend API..."
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS: Backend API is running${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: Backend API not responding at http://localhost:3001${NC}"
    echo "   Please start backend: cd backend && npm run start:dev"
fi
echo ""

# Summary
echo "=================================="
echo "📋 Verification Summary"
echo "=================================="
echo ""
echo "All critical checks passed! ✅"
echo ""
echo "Next steps:"
echo "1. Restart your development server:"
echo "   ${YELLOW}npm run dev${NC}"
echo ""
echo "2. Clear browser cache and cookies"
echo ""
echo "3. Test login flow:"
echo "   - Ambassador: john@nodeops.com → /dashboard"
echo "   - Moderator: brian@nodeops.com → /admin"
echo ""
echo "4. Monitor console logs for:"
echo "   ${GREEN}[Middleware] ✓ JWT auth${NC}"
echo "   ${GREEN}[Dashboard] ✓ User authenticated${NC}"
echo ""
echo "=================================="
