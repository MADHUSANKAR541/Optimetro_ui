import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromToken } from '@/lib/session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('session')?.value;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/setup',
    '/about',
    '/status',
    '/api/auth/login',
    '/api/auth/signup',
    '/api/auth/logout'
  ];

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  );

  if (isPublicRoute) {
    // If user is already logged in and trying to access login/signup, redirect to dashboard
    if (sessionToken && (pathname === '/login' || pathname === '/signup' || pathname === '/')) {
      const session = getSessionFromToken(sessionToken);
      if (session) {
        const dest = session.user.role === 'admin' 
          ? '/admin/dashboard/induction' 
          : '/commuter/dashboard';
        return NextResponse.redirect(new URL(dest, request.url));
      }
    }
    return NextResponse.next();
  }

  // Protected routes - check authentication
  if (!sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const session = getSessionFromToken(sessionToken);
  
  if (!session) {
    // Invalid or expired session
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session');
    return response;
  }

  // Role-based access control
  if (pathname.startsWith('/admin') && session.user.role !== 'admin') {
    return NextResponse.redirect(new URL('/commuter/dashboard', request.url));
  }

  if (pathname.startsWith('/commuter') && session.user.role !== 'commuter') {
    return NextResponse.redirect(new URL('/admin/dashboard/induction', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/commuter/:path*',
    '/admin/:path*',
    '/setup',
    '/',
    '/login',
    '/signup'
  ]
};