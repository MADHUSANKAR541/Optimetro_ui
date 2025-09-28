import { NextRequest, NextResponse } from 'next/server';
import { OperationsCopilot } from '@/lib/copilot';
import { CopilotRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, context, trains, jobCards, brandingSLAs, stablingBays, tripBlocks } = body;
    
    if (!prompt || !context) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt and context' },
        { status: 400 }
      );
    }
    
    // Create copilot request with plan data
    const copilotRequest: CopilotRequest = {
      id: `req_${Date.now()}`,
      prompt,
      context: {
        ...context,
        currentPlan: context.currentPlan || null,
        currentSchedule: context.currentSchedule || null
      },
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    // Create operations copilot with plan data
    const copilot = new OperationsCopilot(
      trains || [],
      jobCards || [],
      brandingSLAs || [],
      stablingBays || [],
      tripBlocks || []
    );
    
    // Process request with plan integration
    const response = await copilot.processRequestWithPlan(copilotRequest);
    
    return NextResponse.json({
      success: true,
      data: response,
      message: 'Copilot request processed successfully'
    });
    
  } catch (error) {
    console.error('Error processing copilot request:', error);
    return NextResponse.json(
      { error: 'Failed to process copilot request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return available copilot commands
    const commands = [
      {
        command: 'withdraw',
        description: 'Withdraw a train from service',
        examples: [
          'Withdraw train 01 due to technical issue',
          'Remove train 05 from service',
          'Take out train 12'
        ]
      },
      {
        command: 'short_turn',
        description: 'Short turn a train at an intermediate station',
        examples: [
          'Short turn train 03 at Station X',
          'Terminate train 07 early at Station Y',
          'Turn back train 15 at Station Z'
        ]
      },
      {
        command: 'gap_fill',
        description: 'Fill a service gap with standby train',
        examples: [
          'Fill gap with standby train',
          'Replace missing service',
          'Inject standby train 20'
        ]
      },
      {
        command: 'skip_stop',
        description: 'Skip a station stop',
        examples: [
          'Skip Station X due to obstruction',
          'Bypass Station Y',
          'Miss Station Z stop'
        ]
      }
    ];
    
    return NextResponse.json({
      success: true,
      data: commands
    });
    
  } catch (error) {
    console.error('Error getting copilot commands:', error);
    return NextResponse.json(
      { error: 'Failed to get copilot commands' },
      { status: 500 }
    );
  }
}
