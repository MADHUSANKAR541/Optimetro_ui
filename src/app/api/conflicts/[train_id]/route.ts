import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  context: { params: Promise<{ train_id: string }> }
): Promise<Response> {
  try {
    const params = (await context?.params) || { train_id: '' };
    const fastapiUrl = process.env.INDUCTION_API_URL;
    const { train_id } = params || { train_id: '' };

    if (!fastapiUrl) {
      return NextResponse.json(
        { error: 'Induction API URL not configured' },
        { status: 503 }
      );
    }

    const res = await fetch(`${fastapiUrl}/api/conflicts/${encodeURIComponent(train_id)}`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`FastAPI request failed: ${res.status}`);
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Conflicts API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch train conflicts' },
      { status: 500 }
    );
  }
}


