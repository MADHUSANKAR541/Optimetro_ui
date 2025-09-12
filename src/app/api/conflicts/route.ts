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

    const res = await fetch(`${fastapiUrl}/api/conflicts`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`FastAPI request failed: ${res.status}`);
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Conflicts API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conflicts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conflictId, action } = body;

    if (action === 'resolve') {
      return NextResponse.json({ 
        success: true, 
        message: `Conflict ${conflictId} resolved successfully` 
      });
    }

    return NextResponse.json({ 
      success: false, 
      message: 'Invalid action' 
    }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to resolve conflict' 
    }, { status: 500 });
  }
}


