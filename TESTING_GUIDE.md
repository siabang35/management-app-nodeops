# Testing Guide - Auth Fix

## Quick Start

### 1. Restart Development Server
```bash
# Stop current server (Ctrl+C if running)
npm run dev
```

### 2. Start Backend API (if not running)
```bash
cd backend
npm run start:dev
```

### 3. Clear Browser Data
**Option A - Chrome/Edge DevTools**:
1. Press `F12` to open DevTools
2. Go to `Application` tab
3. Click `Clear storage` → `Clear site data`

**Option B - Incognito/Private Window**:
- Chrome: `Ctrl+Shift+N`
- Firefox: `Ctrl+Shift+P`
- Edge: `Ctrl+Shift+N`

## Test Scenarios

### Scenario 1: Ambassador Login ✅

**Steps**:
1. Navigate to `http://localhost:3000/auth/login`
2. Enter credentials:
   - Email: `john@nodeops.com`
   - Password: (your password)
3. Click "Sign In"

**Expected Result**:
- ✅ Redirect to `/dashboard`
- ✅ `AmbassadorDashboard` component loads
- ✅ No redirect loop
- ✅ Console shows:
  ```
  [Login] ✓ Success - Role: ambassador
  [Login] Redirecting to /dashboard
  [Middleware] ✓ JWT auth - Email: john@nodeops.com Role: ambassador
  [Dashboard] ✓ User authenticated (middleware validated)
  ```

### Scenario 2: Moderator Login ✅

**Steps**:
1. Navigate to `http://localhost:3000/auth/login`
2. Enter credentials:
   - Email: `brian@nodeops.com`
   - Password: (your password)
3. Click "Sign In"

**Expected Result**:
- ✅ Redirect to `/admin`
- ✅ `ModeratorDashboard` component loads
- ✅ No redirect loop
- ✅ Console shows:
  ```
  [Login] ✓ Success - Role: moderator
  [Login] Redirecting to /admin
  [Middleware] ✓ JWT auth - Email: brian@nodeops.com Role: moderator
  [Admin] ✓ Moderator authenticated (middleware validated)
  ```

### Scenario 3: Role-Based Access Control ✅

**Test A - Ambassador tries to access /admin**:
1. Login as ambassador (john@nodeops.com)
2. Manually navigate to `http://localhost:3000/admin`

**Expected Result**:
- ✅ Middleware redirects to `/dashboard`
- ✅ Console shows:
  ```
  [Middleware] Redirecting non-moderator to /dashboard
  ```

**Test B - Moderator tries to access /dashboard**:
1. Login as moderator (brian@nodeops.com)
2. Manually navigate to `http://localhost:3000/dashboard`

**Expected Result**:
- ✅ Middleware redirects to `/admin`
- ✅ Console shows:
  ```
  [Middleware] Redirecting moderator to /admin
  ```

### Scenario 4: Unauthenticated Access ✅

**Steps**:
1. Clear all cookies (see step 3 above)
2. Navigate to `http://localhost:3000/dashboard`

**Expected Result**:
- ✅ Middleware redirects to `/auth/login?from=/dashboard`
- ✅ Console shows:
  ```
  [Middleware] ✗ No authenticated user, redirecting to login
  ```

## Debugging

### Check Cookies
Open browser console and run:
```javascript
// View all cookies
console.log(document.cookie)

// Should see something like:
// "auth_token=eyJhbGc...; sb-oizxsktwayfiqaszupev-auth-token=..."
```

### Check JWT Token
```javascript
// Get auth token
const cookies = document.cookie.split(';')
const authToken = cookies.find(c => c.trim().startsWith('auth_token='))
console.log('Auth Token:', authToken)

// Decode JWT (simple base64 decode)
if (authToken) {
  const token = authToken.split('=')[1]
  const payload = JSON.parse(atob(token.split('.')[1]))
  console.log('JWT Payload:', payload)
  // Should show: { sub: "user-id", email: "...", role: "...", iat: ..., exp: ... }
}
```

### Check Middleware Headers
```javascript
// In dashboard/admin page, check response headers
fetch(window.location.href)
  .then(res => {
    console.log('x-user-authenticated:', res.headers.get('x-user-authenticated'))
    console.log('x-user-role:', res.headers.get('x-user-role'))
    console.log('x-user-email:', res.headers.get('x-user-email'))
  })
```

### Monitor Network Requests
1. Open DevTools → Network tab
2. Login and watch for:
   - `POST /api/auth/signin` → Status 200
   - `GET /dashboard` → Status 200 (not 307 redirect)
   - Check response cookies

## Common Issues & Solutions

### Issue 1: Still Redirecting to Login

**Symptoms**:
- After login, immediately redirected back to `/auth/login`
- Console shows: `[Dashboard] ✗ No auth cookies found`

**Solutions**:
1. **Check .env.local**:
   ```bash
   cat .env.local | grep SUPABASE_ANON_KEY
   # Should NOT be "your_supabase_anon_key_here"
   ```

2. **Restart dev server**:
   ```bash
   # Kill server and restart
   npm run dev
   ```

3. **Clear ALL cookies**:
   ```javascript
   // In browser console
   document.cookie.split(";").forEach(c => {
     document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
   });
   ```

4. **Check backend is running**:
   ```bash
   curl http://localhost:3001/api/health
   # Should return: {"status":"ok"}
   ```

### Issue 2: Backend Connection Error

**Symptoms**:
- Login fails with "Login failed. Please try again."
- Console shows: `[API] Signin error from backend`

**Solutions**:
1. **Start backend**:
   ```bash
   cd backend
   npm install  # if first time
   npm run start:dev
   ```

2. **Check backend .env**:
   ```bash
   cd backend
   cat .env | grep SUPABASE
   # Should have valid Supabase credentials
   ```

3. **Test backend directly**:
   ```bash
   curl -X POST http://localhost:3001/api/auth/signin \
     -H "Content-Type: application/json" \
     -d '{"email":"john@nodeops.com","password":"your-password"}'
   ```

### Issue 3: Middleware Not Validating JWT

**Symptoms**:
- Console shows: `[Middleware] ✗ JWT token invalid or expired`
- But login was successful

**Solutions**:
1. **Check JWT_SECRET matches**:
   ```bash
   # Frontend .env.local
   grep JWT_SECRET .env.local
   
   # Backend .env
   grep JWT_SECRET backend/.env
   
   # Should be the same!
   ```

2. **Check token expiration**:
   ```javascript
   // In browser console
   const token = document.cookie.split(';').find(c => c.includes('auth_token')).split('=')[1]
   const payload = JSON.parse(atob(token.split('.')[1]))
   console.log('Token expires:', new Date(payload.exp * 1000))
   console.log('Current time:', new Date())
   ```

### Issue 4: Role Not Detected Correctly

**Symptoms**:
- Ambassador redirected to `/admin` or vice versa
- Console shows wrong role

**Solutions**:
1. **Check user role in database**:
   - Go to Supabase Dashboard
   - Open `users` table
   - Find user by email
   - Check `role` column or `user_metadata.role`

2. **Update user role**:
   ```sql
   -- In Supabase SQL Editor
   UPDATE users 
   SET role = 'moderator'  -- or 'ambassador'
   WHERE email = 'user@example.com';
   ```

3. **Check JWT payload**:
   ```javascript
   // Decode token and check role
   const token = document.cookie.split(';').find(c => c.includes('auth_token')).split('=')[1]
   const payload = JSON.parse(atob(token.split('.')[1]))
   console.log('User role:', payload.role)
   ```

## Test Checklist

Use this checklist to verify all functionality:

- [ ] ✅ Ambassador can login
- [ ] ✅ Ambassador redirected to `/dashboard`
- [ ] ✅ Dashboard loads without redirect loop
- [ ] ✅ Ambassador cannot access `/admin` (redirected to `/dashboard`)
- [ ] ✅ Moderator can login
- [ ] ✅ Moderator redirected to `/admin`
- [ ] ✅ Admin panel loads without redirect loop
- [ ] ✅ Moderator cannot access `/dashboard` (redirected to `/admin`)
- [ ] ✅ Unauthenticated users redirected to `/auth/login`
- [ ] ✅ Logout works correctly
- [ ] ✅ No console errors
- [ ] ✅ Cookies are set correctly

## Performance Check

Monitor page load times:

```javascript
// In browser console after page load
console.log('Page load time:', performance.timing.loadEventEnd - performance.timing.navigationStart, 'ms')

// Should be < 3000ms for dashboard
// Should be < 3000ms for admin
```

## Success Criteria

✅ **All tests pass when**:
1. No redirect loops occur
2. Role-based routing works correctly
3. Authentication persists across page refreshes
4. Console shows proper auth flow logs
5. No errors in browser console
6. No errors in server console

---

**Last Updated**: 2025-11-02
**Status**: Ready for Testing
