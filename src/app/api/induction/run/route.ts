import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const fastapiUrl = process.env.INDUCTION_API_URL;
    
    if (!fastapiUrl) {
      return NextResponse.json(
        { error: 'Induction API URL not configured' },
        { status: 503 }
      );
    }

    const response = await fetch(`${fastapiUrl}/induction/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      throw new Error(`FastAPI request failed: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Induction API error:', error);
    
    return NextResponse.json(
      { error: 'Failed to run induction optimization' },
      { status: 500 }
    );
  }
}