import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/simpleAuth';
import { createSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const authResult = await authenticateUser(email, password);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create session
    const sessionToken = createSession(authResult.user);
    console.log('🔐 Session token created, length:', sessionToken.length);

    // Set session cookie
    const response = NextResponse.json(
      {
        success: true,
        user: authResult.user,
        message: 'Login successful'
      },
      { status: 200 }
    );

    console.log('🍪 Setting session cookie...');
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    console.log('✅ Session cookie set successfully');

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
