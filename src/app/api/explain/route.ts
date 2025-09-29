import { NextRequest, NextResponse } from 'next/server';
import { AIExplanation } from '@/lib/types';

type ExplainRequestBody = {
  train_id?: string;
  induction_decision?: string;
  stabling_bay?: string;
  conflicts?: Array<any>;
  predicted_demand?: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ExplainRequestBody;

    const trainId = typeof body.train_id === 'string' ? body.train_id.trim() : '';
    const decision = typeof body.induction_decision === 'string' ? body.induction_decision.trim() : '';
    const stablingBay = typeof body.stabling_bay === 'string' ? body.stabling_bay.trim() : '';
    const conflicts = Array.isArray(body.conflicts) ? body.conflicts : [];
    const predictedDemand = typeof body.predicted_demand === 'number' && isFinite(body.predicted_demand)
      ? body.predicted_demand
      : 0;

    if (!trainId || !decision) {
      return NextResponse.json(
        { error: 'Missing required fields: train_id and induction_decision' },
        { status: 400 }
      );
    }

    // Build a lightweight explainability payload using existing AIExplanation shape
    const conflictConstraints: AIExplanation['reasoning']['constraints'] = conflicts.map((c, idx) => ({
      constraint: typeof c?.type === 'string' ? c.type : `conflict_${idx + 1}`,
      satisfied: false,
      severity: 'hard'
    }));

    const demandFactorImpact: 'positive' | 'negative' | 'neutral' = predictedDemand > 0
      ? (predictedDemand > 70 ? 'positive' : 'neutral')
      : 'neutral';

    const factors: AIExplanation['reasoning']['factors'] = [
      {
        factor: 'Predicted Demand',
        weight: 0.4,
        impact: demandFactorImpact,
        description: `Forecast demand is ${predictedDemand}. Higher demand favors assignment to high-capacity service.`
      },
      {
        factor: 'Operational Conflicts',
        weight: 0.35,
        impact: conflicts.length > 0 ? 'negative' : 'neutral',
        description: conflicts.length > 0
          ? `${conflicts.length} conflicts require resolution (routing/schedule/maintenance).`
          : 'No blocking conflicts identified.'
      },
      {
        factor: 'Stabling Bay Alignment',
        weight: 0.25,
        impact: stablingBay ? 'positive' : 'neutral',
        description: stablingBay
          ? `Preferred stabling bay ${stablingBay} meets turnaround and positioning needs.`
          : 'No stabling bay preference provided.'
      }
    ];

    const explanation: AIExplanation = {
      trainId,
      decision,
      reasoning: {
        factors,
        constraints: conflictConstraints,
        tradeoffs: [
          {
            aspect: 'Service Capacity',
            current: Math.max(0, Math.min(100, predictedDemand)),
            alternative: Math.max(0, Math.min(100, 100 - predictedDemand)),
            explanation: 'Balancing forecast demand coverage with operational feasibility.'
          }
        ]
      },
      confidence: Math.max(0.5, Math.min(0.95, 0.8 - conflicts.length * 0.05 + (demandFactorImpact === 'positive' ? 0.05 : 0))),
      alternatives: [
        {
          action: 'adjust_schedule',
          score: Math.max(0, 0.7 - conflicts.length * 0.1),
          reason: conflicts.length > 0 ? 'Resolve timing/route conflicts before induction.' : 'Schedule can be optimized for demand peaks.'
        },
        {
          action: 'choose_alternate_bay',
          score: stablingBay ? 0.4 : 0.6,
          reason: stablingBay ? 'Current bay is acceptable; alternates may reduce shunting.' : 'Selecting a specific bay may reduce deadheading.'
        }
      ]
    };

    return NextResponse.json({ success: true, data: explanation });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate explanation' },
      { status: 500 }
    );
  }
}


