import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(_request: Request, context: { params: Promise<{ shapeId: string }> }) {
  try {
    if (!supabase) return NextResponse.json({ shapes: [] });
    const { shapeId } = await context.params;
    const { data, error } = await supabase
      .from('gtfs_shapes')
      .select('*')
      .eq('shape_id', shapeId)
      .order('shape_pt_sequence', { ascending: true });
    if (error) throw error;
    return NextResponse.json({ shapes: data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load shapes' }, { status: 500 });
  }
}
