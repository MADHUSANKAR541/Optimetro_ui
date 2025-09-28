# 🚀 Kochi Metro Setup Guide

## Quick Start

### 1. Environment Configuration

The application requires Supabase for database operations. Follow these steps:

#### Option A: Use the Setup Wizard
1. Navigate to `/setup/env` in your browser
2. Fill in your Supabase credentials
3. Copy the generated `.env.local` content
4. Create a `.env.local` file in your project root
5. Paste the content and restart your dev server

#### Option B: Manual Setup
1. Create a `.env.local` file in your project root
2. Copy the content from `env.example`
3. Update the values with your Supabase credentials

### 2. Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and API keys

2. **Run the Database Schema**
   - Open your Supabase SQL Editor
   - Copy and paste the content from `supabase-schema.sql`
   - Execute the SQL to create all necessary tables

3. **Get Your Credentials**
   - Project URL: Found in Settings > API
   - Anon Key: Found in Settings > API
   - Service Role Key: Found in Settings > API (keep this secret!)

### 3. Environment Variables

Create a `.env.local` file with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# JWT Secret (generate a secure random string)
JWT_SECRET=your-secure-jwt-secret-here

# API Configuration
NEXT_PUBLIC_API_MODE=mock
NEXT_PUBLIC_API_BASE=http://localhost:3000/api
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Start Development Server

```bash
npm run dev
```

### 6. Create Admin Account

1. Navigate to `/setup` in your browser
2. Create the initial administrator account
3. Sign in with your admin credentials

## 🔧 Authentication System

### Features
- **Simple Authentication**: No complex OAuth, just email/password
- **Hashed Passwords**: bcrypt with 12 salt rounds
- **JWT Sessions**: Secure token-based authentication
- **Role-based Access**: Admin and Commuter roles
- **Demo Mode**: Works without database for testing

### Demo Accounts (when Supabase not configured)
- **Admin**: `admin@demo.com` / `demo`
- **User**: `user@demo.com` / `demo`

### API Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get current user

## 🗄️ Database Schema

The system uses the following main tables:

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'commuter',
  avatar TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Other Tables
- `metro_lines` - Metro line information
- `stations` - Station data
- `trains` - Train fleet information
- `alerts` - System alerts
- `trips` - Trip records
- `tickets` - Ticket information

## 🚨 Troubleshooting

### Common Issues

#### 1. "Database not configured" Error
- **Cause**: Supabase environment variables not set
- **Solution**: Set up `.env.local` with correct Supabase credentials

#### 2. "Fetch failed" Error
- **Cause**: Network issues or incorrect Supabase URL
- **Solution**: Verify your Supabase URL and network connection

#### 3. "User already exists" Error
- **Cause**: Trying to create duplicate admin account
- **Solution**: Use existing admin account or check database

#### 4. JWT Token Issues
- **Cause**: Missing or invalid JWT_SECRET
- **Solution**: Set a secure JWT_SECRET in your environment variables

### Debug Mode

Enable debug logging by adding to your `.env.local`:
```env
NODE_ENV=development
DEBUG=auth:*
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: 7-day expiration
- **HTTP-only Cookies**: Prevents XSS attacks
- **Role-based Access**: Admin/Commuter separation
- **Input Validation**: Email format, password strength
- **SQL Injection Protection**: Parameterized queries

## 📱 User Roles

### Admin
- Full system access
- User management
- System configuration
- Analytics and reports
- AI dashboard access

### Commuter
- Trip planning
- Ticket booking
- Personal dashboard
- Alerts and notifications

## 🎯 Next Steps

After setup:
1. **Configure AI System**: Set up the AI optimization engine
2. **Import Data**: Use the migration tools to import historical data
3. **Customize**: Modify themes, branding, and features
4. **Deploy**: Set up production environment

## 📞 Support

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure Supabase is properly configured
4. Check the database schema is correctly applied

---

**Happy coding! 🚄✨**
