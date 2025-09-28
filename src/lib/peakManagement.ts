import { 
  RiderProfile, 
  PeakShiftOffer, 
  RewardTransaction,
  TripBlock
} from './types';

export class PeakManagementSystem {
  private riderProfiles: Map<string, RiderProfile>;
  private activeOffers: Map<string, PeakShiftOffer>;
  private rewardTransactions: RewardTransaction[];

  constructor() {
    this.riderProfiles = new Map();
    this.activeOffers = new Map();
    this.rewardTransactions = [];
  }

  /**
   * Analyze rider behavior and create peak shift offers
   */
  async analyzeRiderBehavior(userId: string, tripData: {
    origin: string;
    destination: string;
    intendedTime: string;
    actualTime?: string;
  }): Promise<PeakShiftOffer | null> {
    const profile = this.getOrCreateProfile(userId);
    
    // Check if this is a peak time
    const isPeakTime = this.isPeakTime(tripData.intendedTime);
    if (!isPeakTime) return null;
    
    // Check if rider is flexible
    const flexibilityScore = this.calculateFlexibilityScore(profile, tripData);
    if (flexibilityScore < 0.3) return null; // Not flexible enough
    
    // Check if rider has consent for peak shifting
    if (!profile.consentFlags.peakShifting) return null;
    
    // Generate offer
    const offer = this.generatePeakShiftOffer(profile, tripData);
    if (offer) {
      this.activeOffers.set(offer.id, offer);
    }
    
    return offer;
  }

  /**
   * Process rider response to peak shift offer
   */
  async processOfferResponse(offerId: string, accepted: boolean): Promise<{
    success: boolean;
    rewardPoints?: number;
    message: string;
  }> {
    const offer = this.activeOffers.get(offerId);
    if (!offer) {
      return {
        success: false,
        message: 'Offer not found or expired'
      };
    }
    
    if (offer.status !== 'pending') {
      return {
        success: false,
        message: 'Offer already processed'
      };
    }
    
    if (new Date() > new Date(offer.expiresAt)) {
      offer.status = 'expired';
      return {
        success: false,
        message: 'Offer has expired'
      };
    }
    
    if (accepted) {
      offer.status = 'accepted';
      const profile = this.riderProfiles.get(offer.userId);
      if (profile) {
        profile.rewardPoints += offer.rewardPoints;
        this.recordRewardTransaction({
          id: `reward_${Date.now()}`,
          userId: offer.userId,
          type: 'peak_shift',
          points: offer.rewardPoints,
          description: `Peak shift reward: ${offer.timeShift} minutes`,
          timestamp: new Date().toISOString(),
          verified: true
        });
      }
      
      return {
        success: true,
        rewardPoints: offer.rewardPoints,
        message: `Thank you! You've earned ${offer.rewardPoints} reward points.`
      };
    } else {
      offer.status = 'declined';
      return {
        success: true,
        message: 'No problem! Your original travel time is confirmed.'
      };
    }
  }

  /**
   * Verify compliance with peak shift offer
   */
  async verifyCompliance(offerId: string, actualTapInTime: string): Promise<{
    compliant: boolean;
    rewardPoints?: number;
    message: string;
  }> {
    const offer = this.activeOffers.get(offerId);
    if (!offer || offer.status !== 'accepted') {
      return {
        compliant: false,
        message: 'No active offer found'
      };
    }
    
    const actualTime = new Date(actualTapInTime);
    const suggestedTime = new Date(offer.suggestedTime);
    const timeDifference = Math.abs(actualTime.getTime() - suggestedTime.getTime()) / (1000 * 60); // minutes
    
    // Allow 5-minute tolerance
    if (timeDifference <= 5) {
      const profile = this.riderProfiles.get(offer.userId);
      const bonusPoints = Math.floor(offer.rewardPoints * 0.2); // 20% bonus for compliance
      
      if (profile) {
        profile.rewardPoints += bonusPoints;
        this.recordRewardTransaction({
          id: `reward_${Date.now()}`,
          userId: offer.userId,
          type: 'compliance',
          points: bonusPoints,
          description: `Compliance bonus for peak shift`,
          timestamp: new Date().toISOString(),
          verified: true
        });
      }
      
      return {
        compliant: true,
        rewardPoints: bonusPoints,
        message: `Excellent! You arrived within the suggested time and earned a ${bonusPoints} point compliance bonus.`
      };
    } else {
      return {
        compliant: false,
        message: 'You arrived outside the suggested time window. No bonus points awarded.'
      };
    }
  }

  /**
   * Get rider profile
   */
  getRiderProfile(userId: string): RiderProfile | null {
    return this.riderProfiles.get(userId) || null;
  }

  /**
   * Update rider profile
   */
  updateRiderProfile(userId: string, updates: Partial<RiderProfile>): void {
    const profile = this.getOrCreateProfile(userId);
    Object.assign(profile, updates);
    this.riderProfiles.set(userId, profile);
  }

  /**
   * Get active offers for a rider
   */
  getActiveOffers(userId: string): PeakShiftOffer[] {
    return Array.from(this.activeOffers.values())
      .filter(offer => offer.userId === userId && offer.status === 'pending');
  }

  /**
   * Get reward history for a rider
   */
  getRewardHistory(userId: string): RewardTransaction[] {
    return this.rewardTransactions.filter(transaction => transaction.userId === userId);
  }

  /**
   * Get or create rider profile
   */
  private getOrCreateProfile(userId: string): RiderProfile {
    if (!this.riderProfiles.has(userId)) {
      const profile: RiderProfile = {
        userId,
        hashedId: this.hashUserId(userId),
        typicalTravelTimes: [],
        flexibilityScore: 0.5, // Default moderate flexibility
        rewardPoints: 0,
        consentFlags: {
          peakShifting: false,
          dataAnalytics: false,
          notifications: false
        }
      };
      this.riderProfiles.set(userId, profile);
    }
    return this.riderProfiles.get(userId)!;
  }

  /**
   * Check if time is peak time
   */
  private isPeakTime(time: string): boolean {
    const hour = new Date(time).getHours();
    // Peak hours: 7-9 AM and 5-7 PM
    return (hour >= 7 && hour < 9) || (hour >= 17 && hour < 19);
  }

  /**
   * Calculate rider flexibility score
   */
  private calculateFlexibilityScore(profile: RiderProfile, tripData: any): number {
    let score = profile.flexibilityScore;
    
    // Adjust based on historical behavior
    const historicalTrips = profile.typicalTravelTimes.filter(tt => 
      tt.origin === tripData.origin && tt.destination === tripData.destination
    );
    
    if (historicalTrips.length > 0) {
      // Check if rider has varied their travel times before
      const timeVariations = historicalTrips[0].preferredTimes.length;
      score += Math.min(timeVariations * 0.1, 0.3); // Up to 0.3 bonus for variation
    }
    
    // Check if this is a new route (more flexible)
    if (historicalTrips.length === 0) {
      score += 0.2;
    }
    
    return Math.min(score, 1);
  }

  /**
   * Generate peak shift offer
   */
  private generatePeakShiftOffer(profile: RiderProfile, tripData: any): PeakShiftOffer | null {
    const originalTime = new Date(tripData.intendedTime);
    const timeShift = this.calculateOptimalTimeShift(originalTime);
    
    if (Math.abs(timeShift) < 10) return null; // Not enough shift to matter
    
    const suggestedTime = new Date(originalTime.getTime() + timeShift * 60000);
    const rewardPoints = this.calculateRewardPoints(timeShift);
    
    const offer: PeakShiftOffer = {
      id: `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: profile.userId,
      originalTime: tripData.intendedTime,
      suggestedTime: suggestedTime.toISOString(),
      timeShift,
      rewardPoints,
      reason: this.generateOfferReason(timeShift),
      expiresAt: new Date(Date.now() + 30 * 60000).toISOString(), // 30 minutes
      status: 'pending'
    };
    
    return offer;
  }

  /**
   * Calculate optimal time shift
   */
  private calculateOptimalTimeShift(originalTime: Date): number {
    const hour = originalTime.getHours();
    
    // Morning peak: suggest 10-15 minutes earlier or later
    if (hour >= 7 && hour < 9) {
      return Math.random() > 0.5 ? -12 : 15; // 12 min earlier or 15 min later
    }
    
    // Evening peak: suggest 10-15 minutes earlier or later
    if (hour >= 17 && hour < 19) {
      return Math.random() > 0.5 ? -10 : 12; // 10 min earlier or 12 min later
    }
    
    return 0;
  }

  /**
   * Calculate reward points based on time shift
   */
  private calculateRewardPoints(timeShift: number): number {
    const basePoints = 10;
    const shiftBonus = Math.floor(Math.abs(timeShift) / 5) * 2; // 2 points per 5 minutes
    return Math.min(basePoints + shiftBonus, 25); // Cap at 25 points
  }

  /**
   * Generate offer reason
   */
  private generateOfferReason(timeShift: number): string {
    if (timeShift > 0) {
      return `Help reduce crowding by traveling ${Math.abs(timeShift)} minutes later. You'll earn reward points!`;
    } else {
      return `Help reduce crowding by traveling ${Math.abs(timeShift)} minutes earlier. You'll earn reward points!`;
    }
  }

  /**
   * Record reward transaction
   */
  private recordRewardTransaction(transaction: RewardTransaction): void {
    this.rewardTransactions.push(transaction);
  }

  /**
   * Hash user ID for privacy
   */
  private hashUserId(userId: string): string {
    // Simple hash for demonstration - in production, use proper hashing
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get peak management analytics
   */
  getAnalytics(): {
    totalOffers: number;
    acceptanceRate: number;
    averageTimeShift: number;
    totalRewardPoints: number;
    peakReduction: number;
  } {
    const allOffers = Array.from(this.activeOffers.values());
    const acceptedOffers = allOffers.filter(offer => offer.status === 'accepted');
    const totalRewardPoints = this.rewardTransactions.reduce((sum, t) => sum + t.points, 0);
    
    return {
      totalOffers: allOffers.length,
      acceptanceRate: allOffers.length > 0 ? acceptedOffers.length / allOffers.length : 0,
      averageTimeShift: acceptedOffers.length > 0 ? 
        acceptedOffers.reduce((sum, offer) => sum + Math.abs(offer.timeShift), 0) / acceptedOffers.length : 0,
      totalRewardPoints,
      peakReduction: acceptedOffers.length * 0.1 // Estimate 10% reduction per accepted offer
    };
  }

  /**
   * Clean up expired offers
   */
  cleanupExpiredOffers(): void {
    const now = new Date();
    for (const [id, offer] of this.activeOffers.entries()) {
      if (new Date(offer.expiresAt) < now && offer.status === 'pending') {
        offer.status = 'expired';
      }
    }
  }
}
