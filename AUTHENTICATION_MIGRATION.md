# Authentication System Migration

## Overview
Successfully migrated from NextAuth.js to a simple, custom authentication system using hashed passwords stored in the database.

## Changes Made

### 1. Removed NextAuth.js Dependencies
- Removed `next-auth` from package.json
- Deleted NextAuth configuration files:
  - `src/lib/auth.ts`
  - `src/app/api/auth/[...nextauth]/route.ts`
  - `src/types/next-auth.d.ts`

### 2. New Authentication System

#### Core Authentication Logic
- **`src/lib/simpleAuth.ts`**: Core authentication functions
  - `authenticateUser()`: Validates email/password against database
  - `createUser()`: Creates new user accounts with hashed passwords
  - `getUserById()`: Retrieves user information
  - `updateUserPassword()`: Updates user passwords

#### Session Management
- **`src/lib/session.ts`**: JWT-based session management
  - `createSession()`: Creates JWT tokens for authenticated users
  - `getSessionFromToken()`: Validates and extracts session data
  - `getCurrentSession()`: Gets current user session from cookies

#### React Context
- **`src/contexts/AuthContext.tsx`**: React context for authentication state
  - Provides `user`, `loading`, `login()`, `logout()`, `refreshUser()`
  - Replaces NextAuth's `useSession()` hook

### 3. API Endpoints

#### Authentication APIs
- **`/api/auth/login`**: POST endpoint for user login
- **`/api/auth/logout`**: POST endpoint for user logout  
- **`/api/auth/me`**: GET endpoint to check current session
- **`/api/auth/signup`**: Updated to use new authentication system

### 4. Updated Components

#### Login/Signup Pages
- **`src/app/login/page.tsx`**: Updated to use new AuthContext
- **`src/app/signup/page.tsx`**: Already using direct API calls (no changes needed)

#### Layout Components
- **`src/components/layout/AdminTopbar.tsx`**: Updated to use AuthContext
- **`src/components/layout/CommuterTopbar.tsx`**: Updated to use AuthContext
- **`src/app/providers.tsx`**: Replaced SessionProvider with AuthProvider

### 5. Middleware
- **`src/middleware.ts`**: Completely rewritten to use JWT session validation
  - Validates session tokens from cookies
  - Handles role-based access control
  - Redirects unauthenticated users to login

### 6. Dependencies
- **Added**: `jsonwebtoken` and `@types/jsonwebtoken`
- **Removed**: `next-auth`

## How It Works

### Authentication Flow
1. **Login**: User submits email/password → API validates against database → JWT token created → Cookie set
2. **Session**: Middleware checks JWT token on protected routes → User data extracted from token
3. **Logout**: Cookie cleared → User redirected to login

### Password Security
- Passwords are hashed using `bcryptjs` with 12 salt rounds
- Passwords are never stored in plain text
- JWT tokens contain user information but not passwords

### Session Management
- JWT tokens expire after 7 days
- Tokens are stored in HTTP-only cookies
- Session validation happens on every protected route

## Database Schema
The system uses the existing `users` table with:
- `password_hash`: bcrypt hashed password
- `email`: User email (unique)
- `name`: User display name
- `role`: 'admin' or 'commuter'
- `is_active`: Account status

## Environment Variables
Add to `.env.local`:
```env
JWT_SECRET=your-secret-key-here
```

## Testing
- Test page available at `/test-auth` to verify authentication state
- Demo accounts still work:
  - Admin: `admin@demo.com` / `demo`
  - User: `user@demo.com` / `demo`

## Benefits
1. **Simpler**: No complex NextAuth configuration
2. **Transparent**: Direct control over authentication logic
3. **Secure**: Proper password hashing and JWT tokens
4. **Maintainable**: Clear separation of concerns
5. **Database-driven**: All user data stored in Supabase

## Migration Complete ✅
The authentication system has been successfully migrated from NextAuth.js to a custom solution using hashed passwords and JWT sessions.
