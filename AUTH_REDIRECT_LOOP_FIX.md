# Fix: Redirect Loop ke Halaman Login

## 🔍 Masalah yang Ditemukan

Setelah login berhasil (status 200), user terus diarahkan kembali ke halaman login. Dari log:

```
POST /api/auth/signin 200 in 10073ms
POST /auth/login 200 in 10720ms
GET /dashboard 200 in 5282ms
GET /dashboard 200 in 1975ms
GET /dashboard 200 in 446ms
GET /dashboard 200 in 147ms
GET /auth/login 200 in 165ms  ← Redirect loop!
```

### Root Cause

1. **Race Condition**: Supabase session belum selesai dibuat saat dashboard page melakukan auth check
2. **Client-side check terlalu agresif**: Dashboard langsung redirect tanpa menunggu session ready
3. **JWT token tidak diprioritaskan**: Meskipun JWT token sudah ada di cookie, client-side masih cek Supabase session dulu
4. **Delay tidak cukup**: 500ms delay tidak cukup untuk Supabase session propagation

## ✅ Solusi yang Diterapkan

### 1. **Middleware (`middleware.ts`)**

**Perubahan:**
- ✅ **Prioritaskan JWT token check** sebelum Supabase
- ✅ **Logging yang lebih jelas** dengan emoji untuk debugging
- ✅ **Simplified logic** - JWT token sebagai primary auth method

**Alasan:**
- JWT token dari backend API lebih reliable
- Middleware sudah validasi JWT, jadi jika sampai ke dashboard berarti authorized
- Mengurangi dependency pada Supabase session timing

```typescript
// PRIORITAS 1: Check JWT token first
const authToken = req.cookies.get("auth_token")?.value

if (authToken) {
  const jwtValidation = validateJWT(authToken)
  if (jwtValidation.valid && jwtValidation.payload) {
    // Allow access immediately
    return res
  }
}

// PRIORITAS 2: Fallback ke Supabase
```

### 2. **Dashboard Page (`app/dashboard/page.tsx`)**

**Perubahan:**
- ✅ **JWT token check dulu** sebelum Supabase session
- ✅ **Retry mechanism** dengan exponential backoff untuk Supabase session
- ✅ **Error handling yang lebih baik** dengan fallback ke JWT token
- ✅ **Logging yang lebih detail**

**Alasan:**
- Jika JWT token ada, langsung authorize tanpa tunggu Supabase
- Retry mechanism memberikan waktu untuk Supabase session ready
- Fallback ke JWT token di error handler sebagai last resort

```typescript
// Cek JWT token dulu
const authTokenCookie = cookies.find(c => c.trim().startsWith('auth_token='))

if (authTokenCookie) {
  console.log("[Dashboard] JWT token found, user is authenticated")
  setAuthorized(true)
  setLoading(false)
  return
}

// Retry mechanism untuk Supabase
let retries = 3
let delay = 300

for (let i = 0; i < retries; i++) {
  await new Promise(resolve => setTimeout(resolve, delay))
  const { data } = await supabase.auth.getSession()
  if (data?.session) {
    sessionData = data
    break
  }
  delay *= 1.5 // Exponential backoff
}
```

### 3. **Login Page (`app/auth/login/page.tsx`)**

**Perubahan:**
- ✅ **Delay 300ms** setelah login untuk tunggu cookie diset
- ✅ **window.location.href** untuk full page reload
- ✅ **Logging yang lebih jelas**

**Alasan:**
- Full page reload memastikan semua cookies dan session ter-load dengan benar
- Delay memberikan waktu untuk cookie propagation
- Lebih reliable daripada router.push() untuk auth flow

```typescript
// Wait for cookies to be set
await new Promise(resolve => setTimeout(resolve, 300))

// Full page reload
window.location.href = "/dashboard"
```

### 4. **API Signin Route (`app/api/auth/signin/route.ts`)**

**Perubahan:**
- ✅ **Logging yang lebih detail** untuk debugging
- ✅ **Verify token storage** dengan log

**Alasan:**
- Memudahkan debugging jika ada masalah dengan token storage
- Memastikan token benar-benar tersimpan di cookie

## 🧪 Testing

Untuk test fix ini:

1. **Clear cookies** di browser
2. **Login** dengan credentials yang valid
3. **Perhatikan console logs**:
   ```
   [Login] ✓ Success - Role: ambassador
   [Login] Redirecting to /dashboard
   [Middleware] ✓ JWT auth - Email: user@example.com
   [Dashboard] JWT token found, user is authenticated
   ```
4. **Verify** tidak ada redirect loop ke `/auth/login`

## 📊 Flow Diagram

### Before Fix:
```
Login → API Signin (200) → Dashboard Load → 
Supabase Session Check (not ready) → Redirect to Login ❌
```

### After Fix:
```
Login → API Signin (200) → Set JWT Cookie → 
Full Page Reload → Middleware Check JWT ✓ → 
Dashboard Check JWT ✓ → Show Dashboard ✅
```

## 🔧 Konfigurasi yang Diperlukan

Pastikan `.env.local` memiliki:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📝 Notes

- **JWT token** sekarang menjadi primary authentication method
- **Supabase session** sebagai fallback/secondary method
- **Middleware** melakukan validasi utama
- **Client-side** hanya perlu cek JWT token existence
- **Full page reload** setelah login memastikan state consistency

## 🚀 Next Steps

Jika masih ada masalah:

1. Check browser console untuk logs
2. Check Network tab untuk cookie headers
3. Verify JWT token ada di cookies
4. Check middleware logs di terminal

## 🎯 Expected Behavior

Setelah fix:
- ✅ Login berhasil → Langsung ke dashboard
- ✅ Tidak ada redirect loop
- ✅ Session persistent setelah refresh
- ✅ Role-based routing bekerja dengan benar
