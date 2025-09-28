import { NextRequest, NextResponse } from 'next/server';
import { PeakManagementSystem } from '@/lib/peakManagement';

// Global instance (in production, use proper state management)
const peakManagement = new PeakManagementSystem();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, data } = body;
    
    switch (action) {
      case 'analyze_behavior':
        const offer = await peakManagement.analyzeRiderBehavior(userId, data);
        return NextResponse.json({
          success: true,
          data: offer,
          message: offer ? 'Peak shift offer generated' : 'No offer generated'
        });
        
      case 'respond_to_offer':
        const response = await peakManagement.processOfferResponse(data.offerId, data.accepted);
        return NextResponse.json({
          success: true,
          data: response
        });
        
      case 'verify_compliance':
        const compliance = await peakManagement.verifyCompliance(data.offerId, data.actualTapInTime);
        return NextResponse.json({
          success: true,
          data: compliance
        });
        
      case 'update_profile':
        peakManagement.updateRiderProfile(userId, data);
        return NextResponse.json({
          success: true,
          message: 'Profile updated successfully'
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Error processing peak management request:', error);
    return NextResponse.json(
      { error: 'Failed to process peak management request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }
    
    switch (action) {
      case 'profile':
        const profile = peakManagement.getRiderProfile(userId);
        return NextResponse.json({
          success: true,
          data: profile
        });
        
      case 'offers':
        const offers = peakManagement.getActiveOffers(userId);
        return NextResponse.json({
          success: true,
          data: offers
        });
        
      case 'rewards':
        const rewards = peakManagement.getRewardHistory(userId);
        return NextResponse.json({
          success: true,
          data: rewards
        });
        
      case 'analytics':
        const analytics = peakManagement.getAnalytics();
        return NextResponse.json({
          success: true,
          data: analytics
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Error getting peak management data:', error);
    return NextResponse.json(
      { error: 'Failed to get peak management data' },
      { status: 500 }
    );
  }
}
