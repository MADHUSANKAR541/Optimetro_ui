import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const fastapiUrl = process.env.INDUCTION_API_URL;
    const body = await request.json();

    if (!fastapiUrl) {
      return NextResponse.json(
        { error: 'Induction API URL not configured' },
        { status: 503 }
      );
    }

    const res = await fetch(`${fastapiUrl}/api/demand/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    });
    if (!res.ok) {
      throw new Error(`FastAPI request failed: ${res.status}`);
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Demand forecast API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch demand forecast' },
      { status: 500 }
    );
  }
}


