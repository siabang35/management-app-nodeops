# Authentication Fix - Backend API Integration

## Problem Solved
The Next.js frontend was trying to use Supabase directly with invalid API keys, causing "Invalid API key" errors. The backend NestJS API (port 3001) was working correctly but wasn't being used by the frontend.

## Solution Implemented
Reconfigured the Next.js API routes to proxy authentication requests to the backend API instead of using Supabase directly.

---

## Changes Made

### 1. Created `.env.local`
```bash
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Updated `/app/api/auth/signin/route.ts`
- Removed Supabase client initialization
- Now proxies POST requests to `http://localhost:3001/auth/signin`
- Stores JWT token from backend in httpOnly cookie
- Returns user data in the same format as before

### 3. Updated `/app/api/auth/signup/route.ts`
- Removed Supabase client initialization
- Now proxies POST requests to `http://localhost:3001/auth/signup`
- Forwards all signup data (email, password, fullName, role) to backend
- Returns user data from backend response

---

## How It Works Now

### Authentication Flow

```
Frontend (Next.js)                Backend (NestJS)              Supabase
     │                                  │                          │
     │  1. User submits form            │                          │
     │────────────────────────>         │                          │
     │  POST /api/auth/signin           │                          │
     │                                  │                          │
     │  2. Proxy to backend             │                          │
     │─────────────────────────────────>│                          │
     │     POST /auth/signin            │                          │
     │                                  │                          │
     │                                  │  3. Authenticate         │
     │                                  │─────────────────────────>│
     │                                  │                          │
     │                                  │  4. Return user + token  │
     │                                  │<─────────────────────────│
     │                                  │                          │
     │  5. Store token in cookie        │                          │
     │<─────────────────────────────────│                          │
     │     Return user data             │                          │
     │                                  │                          │
     │  6. Redirect to dashboard        │                          │
     │                                  │                          │
```

### Sign Up Flow
1. User fills signup form at `/auth/signup`
2. Form calls `signUp()` server action
3. Server action POSTs to `/api/auth/signup`
4. Next.js API route forwards to backend `http://localhost:3001/auth/signup`
5. Backend creates user in Supabase
6. Backend returns user data and token
7. Frontend redirects to login page

### Sign In Flow
1. User fills login form at `/auth/login`
2. Form calls `signIn()` server action
3. Server action POSTs to `/api/auth/signin`
4. Next.js API route forwards to backend `http://localhost:3001/auth/signin`
5. Backend authenticates with Supabase
6. Backend returns user data, token, and session
7. Frontend stores token in httpOnly cookie
8. Frontend redirects based on user role (ambassador → /dashboard, moderator → /admin)

---

## Testing Instructions

### Prerequisites
1. **Backend must be running** on port 3001
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Frontend must be running** on port 3000
   ```bash
   npm run dev
   ```

### Test Signup

1. Navigate to `http://localhost:3000/auth/signup`
2. Fill in the form:
   - Email: `testuser@example.com`
   - Password: `Password123!`
   - Full Name: `Test User`
   - Role: `ambassador`
3. Click "Sign Up"
4. **Expected Result**: 
   - Success message appears
   - Redirected to `/auth/login`
   - User created in Supabase (check backend logs)

### Test Signin

1. Navigate to `http://localhost:3000/auth/login`
2. Use the credentials from signup or existing user:
   - Email: `user234@example.com`
   - Password: `Password123`
3. Click "Sign In"
4. **Expected Result**:
   - Success message appears
   - Token stored in cookie
   - Redirected to `/dashboard` (for ambassador) or `/admin` (for moderator)
   - User session persists on page refresh

### Test with Backend Swagger

You can also test the backend API directly:

1. Open `http://localhost:3001/api` (Swagger UI)
2. Test POST `/auth/signup`:
   ```json
   {
     "email": "newuser@example.com",
     "password": "Password123!",
     "fullName": "New User",
     "role": "ambassador"
   }
   ```
3. Test POST `/auth/signin`:
   ```json
   {
     "email": "newuser@example.com",
     "password": "Password123!"
   }
   ```

---

## Troubleshooting

### Error: "Failed to fetch" or "Network error"

**Cause**: Backend is not running or not accessible

**Solution**:
```bash
cd backend
npm run start:dev
```

Verify backend is running at `http://localhost:3001`

### Error: "Invalid credentials" or "User not found"

**Cause**: User doesn't exist or wrong password

**Solution**:
- Sign up first if user doesn't exist
- Check password is correct
- Verify user exists in Supabase dashboard

### Error: "CORS error"

**Cause**: Backend CORS not configured for frontend origin

**Solution**: Check backend CORS configuration allows `http://localhost:3000`

### Token not persisting

**Cause**: Cookie not being set properly

**Solution**:
- Check browser dev tools → Application → Cookies
- Look for `auth_token` cookie
- Verify cookie has correct domain and path

### Still getting "Invalid API key"

**Cause**: Old code still trying to use Supabase directly

**Solution**:
1. Restart Next.js dev server: `npm run dev`
2. Clear browser cache and cookies
3. Verify `.env.local` exists with correct values
4. Check no other `.env` files are overriding values

---

## API Endpoints

### POST /api/auth/signup

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "role": "ambassador"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "ambassador",
    "fullName": "John Doe"
  },
  "message": "Sign up successful.",
  "error": null
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Email already registered"
}
```

### POST /api/auth/signin

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "ambassador",
    "fullName": "John Doe"
  },
  "error": null
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

---

## Environment Variables

### Frontend (.env.local)
```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# Frontend URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Backend (.env)
Should have Supabase credentials:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
```

---

## Security Notes

1. **httpOnly Cookies**: Auth tokens are stored in httpOnly cookies, preventing XSS attacks
2. **Secure Flag**: In production, cookies use the `secure` flag (HTTPS only)
3. **SameSite**: Cookies use `lax` SameSite policy to prevent CSRF
4. **Token Expiry**: Tokens expire after 24 hours
5. **Backend Validation**: All authentication is validated by the backend

---

## Next Steps

1. ✅ Authentication now works through backend API
2. 🔄 Test all authentication flows thoroughly
3. 🔄 Update other API calls to use backend (tasks, teams, reports, etc.)
4. 🔄 Implement token refresh mechanism
5. 🔄 Add email verification flow
6. 🔄 Add password reset functionality

---

## Files Modified

- ✅ `/app/api/auth/signin/route.ts` - Proxy to backend signin
- ✅ `/app/api/auth/signup/route.ts` - Proxy to backend signup
- ✅ `.env.local` - Backend API configuration

## Files Not Modified (Still work as-is)

- `/app/actions/auth.ts` - Server actions still call `/api/auth/*`
- `/app/auth/login/page.tsx` - Login form unchanged
- `/app/auth/signup/page.tsx` - Signup form unchanged
- `/lib/api-client.ts` - API client for other services

---

## Verification Checklist

- [ ] Backend running on port 3001
- [ ] Frontend running on port 3000
- [ ] `.env.local` created with correct values
- [ ] Can sign up new user
- [ ] Can sign in with existing user
- [ ] Token stored in cookie
- [ ] Redirects work based on role
- [ ] Session persists on page refresh
- [ ] Can sign out successfully
- [ ] Backend logs show successful authentication

---

## Support

If you encounter issues:

1. Check both frontend and backend logs
2. Verify backend is running and accessible
3. Test backend API directly via Swagger
4. Check browser console for errors
5. Verify environment variables are set correctly
6. Restart both servers after changes
