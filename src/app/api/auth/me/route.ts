import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      // 401 is expected when user is not logged in - don't log as error
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.log('✅ Session found for user:', session.user.email);
    return NextResponse.json({
      success: true,
      user: session.user
    });
  } catch (error) {
    console.error('❌ Session check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
