import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const { role } = await request.json();

    if (!role || !['admin', 'commuter'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin or commuter' },
        { status: 400 }
      );
    }

    // Create demo user based on role
    const demoUser = {
      id: `demo-${role}`,
      email: `${role}@demo.com`,
      name: `Demo ${role === 'admin' ? 'Admin' : 'User'}`,
      role: role as 'admin' | 'commuter'
    };

    // Create session
    const sessionToken = createSession(demoUser);
    console.log('🎫 Guest session created for:', demoUser.email);

    // Set session cookie
    const response = NextResponse.json(
      {
        success: true,
        user: demoUser,
        message: 'Guest login successful'
      },
      { status: 200 }
    );

    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Guest login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
