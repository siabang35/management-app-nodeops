# API Routing Fix - Summary

## Problem
The frontend was receiving 404 errors when trying to access authentication endpoints:
- `POST /api/auth/signup` → 404
- `POST /api/auth/signin` → 404

## Root Cause
There was a mismatch between the frontend API routes and the backend NestJS routes:
- **Frontend**: Expected backend at `http://localhost:3001/api/auth/*`
- **Backend**: Routes were registered at `/auth/*` (without `/api` prefix)

## Solution Applied

### 1. Added Global API Prefix to NestJS Backend
**File**: `/vercel/sandbox/backend/src/main.ts`

Added `app.setGlobalPrefix("api")` to prefix all backend routes with `/api`.

**Result**: All backend routes are now accessible at:
- `/api/auth/signup`
- `/api/auth/signin`
- `/api/tasks`
- `/api/teams`
- `/api/reports`
- `/api/mindshare`

### 2. Updated Next.js API Route Handlers
**Files**:
- `/vercel/sandbox/app/api/auth/signup/route.ts`
- `/vercel/sandbox/app/api/auth/signin/route.ts`

Changed fetch URLs from:
- `${BACKEND_API_URL}/auth/signup` → `${BACKEND_API_URL}/api/auth/signup`
- `${BACKEND_API_URL}/auth/signin` → `${BACKEND_API_URL}/api/auth/signin`

### 3. Updated Server API Client
**File**: `/vercel/sandbox/lib/server-api.ts`

Changed `BACKEND_INTERNAL_URL` from:
- `http://localhost:3001` → `http://localhost:3001/api`

This ensures all server-side API calls (tasks, teams, reports, mindshare) include the `/api` prefix.

### 4. Updated Environment Configuration
**Files**:
- `/vercel/sandbox/.env.example`
- `/vercel/sandbox/.env` (created)

Changed `NEXT_PUBLIC_API_URL` from:
- `http://localhost:3001/api` → `http://localhost:3001`

The `/api` prefix is now handled by the route handlers and server API client.

## API Flow After Fix

### Authentication Flow
```
User → Frontend Form
  ↓
Next.js API Route (/api/auth/signup)
  ↓
Fetch to: http://localhost:3001/api/auth/signup
  ↓
NestJS Backend (with global prefix)
  ↓
Response back to frontend
```

### Other API Calls (Tasks, Teams, etc.)
```
Server Action
  ↓
serverApiClient.get('/tasks')
  ↓
Fetch to: http://localhost:3001/api/tasks
  ↓
NestJS Backend
  ↓
Response
```

## Testing Instructions

### 1. Restart Backend Server
The backend must be restarted for the global prefix to take effect:

```bash
cd backend
npm run start:dev
# or
yarn start:dev
```

### 2. Verify Backend Routes
After restart, check the console output. Routes should now show:
```
[RouterExplorer] Mapped {/api/auth/signup, POST} route
[RouterExplorer] Mapped {/api/auth/signin, POST} route
[RouterExplorer] Mapped {/api/tasks, GET} route
...
```

### 3. Test Authentication
- Navigate to signup page
- Create a new account
- Should successfully create user without 404 errors
- Try logging in
- Should successfully authenticate

### 4. Verify API Documentation
Swagger docs are still available at: `http://localhost:3001/api`

## Files Modified

1. `/vercel/sandbox/backend/src/main.ts` - Added global API prefix
2. `/vercel/sandbox/app/api/auth/signup/route.ts` - Updated fetch URL
3. `/vercel/sandbox/app/api/auth/signin/route.ts` - Updated fetch URL
4. `/vercel/sandbox/lib/server-api.ts` - Updated base URL
5. `/vercel/sandbox/.env.example` - Updated API URL
6. `/vercel/sandbox/.env` - Created with correct configuration

## Expected Behavior

✅ **Before**: 404 errors on authentication endpoints
✅ **After**: Successful authentication and API calls

All API endpoints should now work correctly with the `/api` prefix.
