import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { data: currentUser, error: currentUserError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (currentUserError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json({
      users: users || [],
      currentUser
    });

  } catch (error) {
    console.error('Error in users API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
