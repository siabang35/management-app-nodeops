# Fix: Redirect Loop ke Halaman Login

## Masalah
Setelah login sukses, aplikasi terus redirect kembali ke halaman login (redirect loop). Ini terjadi karena:

1. **Login menggunakan Backend NestJS API** yang mengembalikan JWT token
2. **Middleware dan Dashboard Pages menggunakan Supabase** untuk validasi session
3. Setelah login via backend API, **Supabase tidak memiliki session yang valid**
4. Middleware dan dashboard pages mendeteksi tidak ada Supabase session → redirect ke login

## Solusi yang Diterapkan

### 1. Dual Authentication Support
Aplikasi sekarang mendukung **dua metode autentikasi**:
- **Supabase Session** (primary)
- **JWT Token** (fallback)

### 2. File yang Diubah

#### a. `/lib/jwt-utils.ts` (NEW)
Utility functions untuk decode dan validasi JWT token:
- `decodeJWT()` - Decode JWT payload
- `isJWTExpired()` - Cek apakah token expired
- `validateJWT()` - Validasi token dan return payload

#### b. `/app/api/auth/signin/route.ts`
**Perubahan:**
- Setelah login sukses ke backend API, **buat Supabase session juga**
- Gunakan `supabase.auth.signInWithPassword()` untuk sinkronisasi
- Jika Supabase login gagal, tetap lanjutkan (backend auth sudah sukses)

**Benefit:**
- User yang login akan memiliki **kedua** session (Backend JWT + Supabase)
- Middleware dan dashboard pages bisa menggunakan Supabase auth

#### c. `/middleware.ts`
**Perubahan:**
- Coba Supabase auth terlebih dahulu
- Jika gagal, **fallback ke JWT token validation**
- Validasi JWT token dari cookie `auth_token`
- Role-based routing tetap berfungsi untuk kedua metode auth

**Benefit:**
- Tidak ada redirect loop jika Supabase session belum ready
- Support user yang hanya punya JWT token

#### d. `/app/dashboard/page.tsx`
**Perubahan:**
- Tambahkan **delay 500ms** sebelum cek auth (tunggu session ready)
- Jika Supabase session tidak ada, **cek JWT token dari cookie**
- Jika JWT token ada, allow access (middleware sudah validasi)

**Benefit:**
- Tidak langsung redirect jika session belum ready
- Support JWT-only authentication

#### e. `/app/admin/page.tsx`
**Perubahan:**
- Sama seperti dashboard page
- Tambahkan delay dan fallback JWT validation
- Middleware sudah handle role-based redirect

**Benefit:**
- Moderator bisa akses admin panel dengan JWT atau Supabase session

## Alur Autentikasi Setelah Fix

### Login Flow:
```
1. User submit login form
   ↓
2. Call /api/auth/signin
   ↓
3. Forward ke Backend NestJS API
   ↓
4. Backend return JWT token + user data
   ↓
5. Store JWT token di cookie 'auth_token'
   ↓
6. Login ke Supabase dengan credentials yang sama
   ↓
7. Supabase session created (jika berhasil)
   ↓
8. Return success ke client
   ↓
9. Client redirect berdasarkan role:
   - Ambassador → /dashboard
   - Moderator → /admin
```

### Middleware Flow:
```
1. User akses protected route (/dashboard atau /admin)
   ↓
2. Middleware check Supabase session
   ↓
3a. Jika Supabase session valid:
    - Extract role dari user_metadata
    - Role-based routing
    - Allow access
   ↓
3b. Jika Supabase session tidak valid:
    - Check JWT token dari cookie
    - Validate JWT token
    - Extract role dari JWT payload
    - Role-based routing
    - Allow access
   ↓
4. Jika kedua auth method gagal:
   - Redirect ke /auth/login
```

### Dashboard/Admin Page Flow:
```
1. Page component mount
   ↓
2. Wait 500ms (tunggu session ready)
   ↓
3. Check Supabase session
   ↓
4a. Jika Supabase session valid:
    - Extract role
    - Validate role (dashboard: ambassador, admin: moderator)
    - Show dashboard component
   ↓
4b. Jika Supabase session tidak valid:
    - Check JWT token dari cookie
    - If exists, allow access (middleware sudah validasi)
    - Show dashboard component
   ↓
5. Jika kedua auth method gagal:
   - Redirect ke /auth/login
```

## Role-Based Routing

### Ambassador (role: "ambassador")
- Login → Redirect ke `/dashboard`
- Akses `/admin` → Redirect ke `/dashboard` (by middleware)
- Dashboard menampilkan `AmbassadorDashboard` component

### Moderator (role: "moderator")
- Login → Redirect ke `/admin`
- Akses `/dashboard` → Redirect ke `/admin` (by middleware)
- Admin page menampilkan `ModeratorDashboard` component

## Testing

### Test Case 1: Login sebagai Ambassador
```
1. Login dengan akun ambassador
2. Harus redirect ke /dashboard
3. Dashboard harus menampilkan AmbassadorDashboard
4. Tidak ada redirect loop
```

### Test Case 2: Login sebagai Moderator
```
1. Login dengan akun moderator
2. Harus redirect ke /admin
3. Admin page harus menampilkan ModeratorDashboard
4. Tidak ada redirect loop
```

### Test Case 3: Akses Protected Route tanpa Login
```
1. Akses /dashboard tanpa login
2. Harus redirect ke /auth/login
```

### Test Case 4: Role-based Access Control
```
1. Login sebagai ambassador
2. Coba akses /admin
3. Harus redirect ke /dashboard (by middleware)
```

## Catatan Penting

1. **Dual Authentication**: Aplikasi sekarang support dua metode auth. Ini memberikan fleksibilitas dan menghindari race condition.

2. **Delay 500ms**: Delay ini penting untuk memberi waktu Supabase session untuk ready setelah login. Tanpa delay, page component bisa cek session sebelum session dibuat.

3. **JWT Token Validation**: JWT token divalidasi di middleware dan dashboard pages. Ini memastikan user yang hanya punya JWT token (tanpa Supabase session) tetap bisa akses aplikasi.

4. **Role dari JWT Payload**: Jika menggunakan JWT auth, role diambil dari JWT payload (`payload.role`). Pastikan backend API menyertakan role di JWT payload.

5. **Cookie Security**: JWT token disimpan di httpOnly cookie untuk keamanan. Client-side JavaScript tidak bisa akses token secara langsung.

## Troubleshooting

### Masih Redirect Loop?
1. Clear browser cookies
2. Check console log untuk error
3. Pastikan backend API running
4. Pastikan Supabase credentials benar di `.env.local`

### JWT Token Tidak Valid?
1. Check JWT token format di backend
2. Pastikan token include `sub`, `email`, `role`, dan `exp`
3. Check token expiration time

### Role-based Routing Tidak Bekerja?
1. Check user role di database
2. Pastikan role disimpan di `user_metadata.role` (Supabase)
3. Pastikan role disimpan di JWT payload (Backend)
4. Check middleware logs untuk debug

## Dependencies
- `@supabase/ssr` - Supabase SSR client
- `next` - Next.js framework
- Backend NestJS API dengan JWT authentication
