import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  context: { params: Promise<{ train_id: string }> }
): Promise<Response> {
  try {
    const params = (await context?.params) || { train_id: '' };
    const fastapiUrl = process.env.INDUCTION_API_URL;
    const { train_id } = params || { train_id: '' };

    const mockResponse = () => {
      const hasConflicts = Number(train_id.slice(-1)) % 2 === 0;
      const item = {
        train_id,
        conflicts: hasConflicts
          ? [
              { rule: 'fitness', status: 'failed', reason: 'Fitness expired' },
              { rule: 'job_card', status: 'failed', reason: 'Open high-priority job card' },
            ]
          : [],
      };
      return NextResponse.json(item);
    };

    if (!fastapiUrl) {
      return mockResponse();
    }

    const res = await fetch(`${fastapiUrl}/api/conflicts/${encodeURIComponent(train_id)}`, { cache: 'no-store' });
    if (!res.ok) {
      return mockResponse();
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (_e) {
    let fallbackId = '';
    try {
      const p = await context?.params;
      fallbackId = p?.train_id || '';
    } catch {}
    return NextResponse.json({ train_id: fallbackId, conflicts: [] });
  }
}


