# Authentication Architecture

## Before Fix (❌ Broken)

```
User Browser
    │
    ├─ Visit: /auth/signup (Page)
    │   └─ Form Submit
    │       └─ POST to /auth/signup ❌ (This is a PAGE, not an API!)
    │           └─ Result: 404 Not Found
    │
    └─ Visit: /auth/login (Page)
        └─ Form Submit
            └─ POST to /auth/login ❌ (This is a PAGE, not an API!)
                └─ Result: 404 Not Found
```

**Problem:** Next.js pages can't handle POST requests. They're for rendering UI only.

---

## After Fix (✅ Working)

```
User Browser
    │
    ├─ Visit: /auth/signup (Page - UI Only)
    │   └─ Form Submit
    │       └─ Calls: signUp() Server Action
    │           └─ POST to /api/auth/signup ✅ (API Route)
    │               └─ Supabase Auth
    │                   └─ Create User
    │                       └─ Return Success
    │                           └─ Redirect to /auth/login
    │
    └─ Visit: /auth/login (Page - UI Only)
        └─ Form Submit
            └─ Calls: signIn() Server Action
                └─ POST to /api/auth/signin ✅ (API Route)
                    └─ Supabase Auth
                        └─ Verify Credentials
                            └─ Set Session Cookie
                                └─ Return User Data
                                    └─ Redirect to /dashboard or /admin
```

---

## File Structure

```
app/
├── auth/
│   ├── login/
│   │   └── page.tsx          ← UI Component (Login Form)
│   └── signup/
│       └── page.tsx          ← UI Component (Signup Form)
│
├── api/                      ← NEW! API Routes
│   └── auth/
│       ├── signin/
│       │   └── route.ts      ← Handles POST /api/auth/signin
│       └── signup/
│           └── route.ts      ← Handles POST /api/auth/signup
│
└── actions/
    └── auth.ts               ← Server Actions (Updated)
```

---

## Request Flow Diagram

### Sign Up Flow

```
┌─────────────────┐
│  User fills     │
│  signup form    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  /auth/signup (page.tsx)                │
│  - Validates password requirements      │
│  - Checks password match                │
└────────┬────────────────────────────────┘
         │ onSubmit
         ▼
┌─────────────────────────────────────────┐
│  signUp() Server Action                 │
│  (app/actions/auth.ts)                  │
│  - Prepares request data                │
└────────┬────────────────────────────────┘
         │ POST
         ▼
┌─────────────────────────────────────────┐
│  /api/auth/signup (route.ts)            │
│  - Validates email & password           │
│  - Calls Supabase Auth                  │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Supabase                               │
│  - Creates user account                 │
│  - Stores metadata (role, fullName)     │
│  - Returns user object                  │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Response back to browser               │
│  - success: true                        │
│  - user: { id, email, role, fullName }  │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Redirect to /auth/login                │
└─────────────────────────────────────────┘
```

### Sign In Flow

```
┌─────────────────┐
│  User enters    │
│  credentials    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  /auth/login (page.tsx)                 │
│  - Email & password input               │
└────────┬────────────────────────────────┘
         │ onSubmit
         ▼
┌─────────────────────────────────────────┐
│  signIn() Server Action                 │
│  (app/actions/auth.ts)                  │
└────────┬────────────────────────────────┘
         │ POST
         ▼
┌─────────────────────────────────────────┐
│  /api/auth/signin (route.ts)            │
│  - Validates credentials                │
│  - Calls Supabase Auth                  │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Supabase                               │
│  - Verifies email & password            │
│  - Creates session                      │
│  - Sets auth cookies                    │
│  - Returns user + session               │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Response back to browser               │
│  - success: true                        │
│  - user: { id, email, role, fullName }  │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Check user role                        │
│  - moderator → /admin                   │
│  - ambassador → /dashboard              │
└─────────────────────────────────────────┘
```

---

## Key Concepts

### 1. Pages vs API Routes

| Type | Purpose | Can Handle |
|------|---------|------------|
| **Page** (`page.tsx`) | Render UI | GET requests only |
| **API Route** (`route.ts`) | Handle data | GET, POST, PUT, DELETE, etc. |

### 2. Server Actions

Server Actions (`"use server"`) are functions that run on the server but can be called from client components. They're perfect for form submissions.

```typescript
// app/actions/auth.ts
"use server"

export async function signIn(email: string, password: string) {
  // This runs on the server
  const response = await fetch('/api/auth/signin', { ... })
  return response.json()
}
```

### 3. API Routes

API Routes handle HTTP requests and return JSON responses.

```typescript
// app/api/auth/signin/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json()
  // Process authentication
  return NextResponse.json({ success: true, user: {...} })
}
```

---

## Security Flow

```
┌──────────────────────────────────────────────┐
│  1. User submits credentials                 │
└────────────────┬─────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────┐
│  2. HTTPS encrypts data in transit           │
└────────────────┬─────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────┐
│  3. Server Action validates input            │
└────────────────┬─────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────┐
│  4. API Route processes request              │
└────────────────┬─────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────┐
│  5. Supabase verifies credentials            │
│     - Checks password hash                   │
│     - Validates email format                 │
└────────────────┬─────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────┐
│  6. Session created with JWT                 │
│     - Stored in httpOnly cookie              │
│     - Cannot be accessed by JavaScript       │
└────────────────┬─────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────┐
│  7. Middleware checks auth on each request   │
│     - Validates session                      │
│     - Enforces role-based access             │
└──────────────────────────────────────────────┘
```

---

## Environment Variables

```bash
# Required for authentication to work
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Used by server actions to construct API URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Why NEXT_PUBLIC_?**
- Variables with this prefix are exposed to the browser
- Required for client-side Supabase initialization
- Safe because the anon key is meant to be public (protected by RLS)

---

## Error Handling

```
User Action
    │
    ├─ Network Error
    │   └─ Caught by try/catch
    │       └─ Display: "An error occurred"
    │
    ├─ Invalid Credentials
    │   └─ Supabase returns error
    │       └─ Display: "Invalid email or password"
    │
    ├─ Email Already Exists
    │   └─ Supabase returns error
    │       └─ Display: "Email already registered"
    │
    └─ Validation Error
        └─ Caught before API call
            └─ Display: "Please fill in all fields"
```

---

## Testing Checklist

- [ ] Sign up with new email
- [ ] Sign up with existing email (should fail)
- [ ] Sign up with weak password (should fail)
- [ ] Sign up with mismatched passwords (should fail)
- [ ] Sign in with correct credentials
- [ ] Sign in with wrong password (should fail)
- [ ] Sign in with non-existent email (should fail)
- [ ] Ambassador redirects to /dashboard
- [ ] Moderator redirects to /admin
- [ ] Session persists after page refresh
- [ ] Sign out clears session

---

## Troubleshooting

### Issue: Still getting 404

**Check:**
1. API routes exist at correct paths
2. Server is restarted
3. No typos in fetch URLs

### Issue: "supabaseKey is required"

**Check:**
1. `.env.local` exists
2. Variables are set correctly
3. No extra spaces in values
4. Server is restarted after changing .env

### Issue: Authentication works but redirects fail

**Check:**
1. `middleware.ts` is configured correctly
2. User role is being set in metadata
3. Console logs show correct role value

---

## Next Steps

1. ✅ Authentication is working
2. 🔄 Add email verification (optional)
3. 🔄 Add password reset flow
4. 🔄 Add OAuth providers (Google, GitHub, etc.)
5. 🔄 Implement role-based permissions
6. 🔄 Add user profile management

See Supabase documentation for advanced features!
