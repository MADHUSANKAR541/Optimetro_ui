import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/simpleAuth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role = 'commuter' } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const result = await createUser(email, password, name, role);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create user' },
        { status: result.error === 'User with this email already exists' ? 409 : 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: result.user
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
