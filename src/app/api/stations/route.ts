import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    const fastapiUrl = process.env.INDUCTION_API_URL;
    if (!fastapiUrl) {
      return NextResponse.json(
        { error: 'Induction API URL not configured' },
        { status: 503 }
      );
    }

    const res = await fetch(`${fastapiUrl}/api/stations`);
    if (!res.ok) {
      throw new Error(`FastAPI request failed: ${res.status}`);
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Stations API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stations' },
      { status: 500 }
    );
  }
}


