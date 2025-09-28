import { 
  Train, 
  JobCard, 
  BrandingSLA, 
  CleaningSlot, 
  StablingBay, 
  TripBlock,
  OptimizationConfig,
  OptimizationResponse,
  TrainDecision,
  AIExplanation,
  InductionPlan,
  Conflict
} from './types';

export class AIOptimizationEngine {
  private config: OptimizationConfig;
  private trains: Train[];
  private jobCards: JobCard[];
  private brandingSLAs: BrandingSLA[];
  private cleaningSlots: CleaningSlot[];
  private stablingBays: StablingBay[];
  private tripBlocks: TripBlock[];

  constructor(
    config: OptimizationConfig,
    trains: Train[],
    jobCards: JobCard[],
    brandingSLAs: BrandingSLA[],
    cleaningSlots: CleaningSlot[],
    stablingBays: StablingBay[],
    tripBlocks: TripBlock[]
  ) {
    this.config = config;
    this.trains = trains;
    this.jobCards = jobCards;
    this.brandingSLAs = brandingSLAs;
    this.cleaningSlots = cleaningSlots;
    this.stablingBays = stablingBays;
    this.tripBlocks = tripBlocks;
  }

  /**
   * Generate nightly induction plan using AI optimization
   */
  async generateInductionPlan(): Promise<InductionPlan> {
    const startTime = Date.now();
    
    // Step 1: Compute train scores based on multiple factors
    const trainScores = this.computeTrainScores();
    
    // Step 2: Apply constraint optimization
    const optimizationResult = await this.solveOptimization(trainScores);
    
    // Step 3: Generate AI explanations for each decision
    const explanations = await this.generateExplanations(optimizationResult.decisions);
    
    // Step 4: Create comprehensive plan
    const plan: InductionPlan = {
      id: `plan_${Date.now()}`,
      modelVersion: '1.0.0',
      objectiveWeights: this.config.weights,
      seed: this.config.seed || Math.random(),
      generatedAt: new Date().toISOString(),
      decisions: optimizationResult.decisions,
      conflicts: optimizationResult.conflicts,
      metrics: optimizationResult.metrics
    };

    return plan;
  }

  /**
   * Compute comprehensive scores for each train based on multiple factors
   */
  private computeTrainScores(): Map<string, number> {
    const scores = new Map<string, number>();
    
    for (const train of this.trains) {
      let score = 0;
      
      // Fitness factor (40% weight)
      const fitnessScore = this.computeFitnessScore(train);
      score += fitnessScore * 0.4;
      
      // Job card factor (25% weight)
      const jobCardScore = this.computeJobCardScore(train);
      score += jobCardScore * 0.25;
      
      // Mileage balance factor (20% weight)
      const mileageScore = this.computeMileageScore(train);
      score += mileageScore * 0.2;
      
      // Branding factor (10% weight)
      const brandingScore = this.computeBrandingScore(train);
      score += brandingScore * 0.1;
      
      // Cleaning factor (5% weight)
      const cleaningScore = this.computeCleaningScore(train);
      score += cleaningScore * 0.05;
      
      scores.set(train.id, score);
    }
    
    return scores;
  }

  /**
   * Compute fitness score based on certificate validity
   */
  private computeFitnessScore(train: Train): number {
    const now = new Date();
    let score = 0;
    
    // Rolling stock fitness
    const rollingStockExpiry = new Date(train.fitness.rollingStockExpiry);
    if (rollingStockExpiry > now) {
      const daysValid = (rollingStockExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      score += Math.min(daysValid / 30, 1) * 0.4; // Max score if valid for 30+ days
    }
    
    // Signalling fitness
    const signallingExpiry = new Date(train.fitness.signallingExpiry);
    if (signallingExpiry > now) {
      const daysValid = (signallingExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      score += Math.min(daysValid / 30, 1) * 0.3;
    }
    
    // Telecom fitness
    const telecomExpiry = new Date(train.fitness.telecomExpiry);
    if (telecomExpiry > now) {
      const daysValid = (telecomExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      score += Math.min(daysValid / 30, 1) * 0.3;
    }
    
    return score;
  }

  /**
   * Compute job card score (negative impact for open critical cards)
   */
  private computeJobCardScore(train: Train): number {
    const trainJobCards = this.jobCards.filter(jc => jc.trainId === train.id && jc.status === 'open');
    
    let score = 1; // Start with perfect score
    
    for (const jobCard of trainJobCards) {
      if (jobCard.severity === 'critical') {
        score -= 0.5; // Heavy penalty for critical open cards
      } else if (jobCard.severity === 'high') {
        score -= 0.3;
      } else if (jobCard.severity === 'medium') {
        score -= 0.1;
      }
    }
    
    return Math.max(score, 0); // Don't go below 0
  }

  /**
   * Compute mileage balance score
   */
  private computeMileageScore(train: Train): number {
    const allMileages = this.trains.map(t => t.odoKm);
    const avgMileage = allMileages.reduce((sum, m) => sum + m, 0) / allMileages.length;
    const variance = allMileages.reduce((sum, m) => sum + Math.pow(m - avgMileage, 2), 0) / allMileages.length;
    const stdDev = Math.sqrt(variance);
    
    // Score based on how close to average (lower is better for balance)
    const deviation = Math.abs(train.odoKm - avgMileage);
    const score = Math.max(0, 1 - (deviation / (2 * stdDev)));
    
    return score;
  }

  /**
   * Compute branding SLA score
   */
  private computeBrandingScore(train: Train): number {
    const trainBranding = this.brandingSLAs.find(bs => bs.trainId === train.id);
    if (!trainBranding) return 0.5; // Neutral if no branding requirements
    
    const compliance = trainBranding.hoursDelivered / trainBranding.minHoursWeek;
    return Math.min(compliance, 1); // Cap at 1
  }

  /**
   * Compute cleaning slot availability score
   */
  private computeCleaningScore(train: Train): number {
    const availableSlots = this.cleaningSlots.filter(cs => cs.status === 'available');
    if (availableSlots.length === 0) return 0;
    
    // Prefer trains that can be cleaned during off-peak hours
    const offPeakSlots = availableSlots.filter(cs => {
      const hour = new Date(cs.start).getHours();
      return hour < 6 || hour > 22; // Off-peak hours
    });
    
    return offPeakSlots.length / availableSlots.length;
  }

  /**
   * Solve optimization problem using constraint programming
   */
  private async solveOptimization(trainScores: Map<string, number>): Promise<OptimizationResponse> {
    // This would integrate with your existing OR-Tools backend
    // For now, return a mock result that demonstrates the structure
    
    const decisions: TrainDecision[] = [];
    const conflicts: Conflict[] = [];
    
    // Sort trains by score (highest first)
    const sortedTrains = Array.from(trainScores.entries())
      .sort(([,a], [,b]) => b - a);
    
    let revenueCount = 0;
    let standbyCount = 0;
    let maintenanceCount = 0;
    
    for (const [trainId, score] of sortedTrains) {
      const train = this.trains.find(t => t.id === trainId);
      if (!train) continue;
      
      let action: 'revenue' | 'standby' | 'IBL' = 'standby';
      let reason = '';
      let constraints: string[] = [];
      
      // Apply business rules
      if (score > 0.8 && revenueCount < this.config.constraints.maxRun) {
        action = 'revenue';
        reason = 'High fitness score, no critical job cards, good mileage balance';
        revenueCount++;
      } else if (score < 0.3 || this.hasCriticalJobCards(trainId)) {
        action = 'IBL';
        reason = 'Low fitness score or critical job cards require maintenance';
        maintenanceCount++;
      } else if (standbyCount < this.config.constraints.maxStandby) {
        action = 'standby';
        reason = 'Available for standby service';
        standbyCount++;
      } else {
        action = 'IBL';
        reason = 'No standby slots available, assigned to maintenance';
        maintenanceCount++;
      }
      
      // Check for conflicts
      if (this.hasFitnessConflicts(trainId)) {
        constraints.push('Fitness certificate expires during service window');
      }
      
      if (this.hasJobCardConflicts(trainId)) {
        constraints.push('Open critical job cards');
      }
      
      if (this.hasBrandingConflicts(trainId)) {
        constraints.push('Branding SLA at risk');
      }
      
      decisions.push({
        trainId,
        action,
        score,
        reason,
        constraints,
        confidence: Math.min(score, 1),
        bayAssignment: this.findOptimalBay(trainId, action),
        estimatedTurnout: this.calculateTurnoutTime(trainId, action)
      });
    }
    
    return {
      status: 'optimal',
      objectiveValue: Array.from(trainScores.values()).reduce((sum, score) => sum + score, 0),
      solveTime: Date.now(),
      decisions,
      conflicts,
      metrics: {
        totalShunting: this.calculateTotalShunting(decisions),
        mileageVariance: this.calculateMileageVariance(decisions),
        brandingCompliance: this.calculateBrandingCompliance(decisions),
        constraintViolations: decisions.reduce((sum, d) => sum + d.constraints.length, 0)
      },
      explanation: []
    };
  }

  /**
   * Generate AI explanations for decisions
   */
  private async generateExplanations(decisions: TrainDecision[]): Promise<AIExplanation[]> {
    const explanations: AIExplanation[] = [];
    
    for (const decision of decisions) {
      const train = this.trains.find(t => t.id === decision.trainId);
      if (!train) continue;
      
      const explanation: AIExplanation = {
        trainId: decision.trainId,
        decision: decision.action,
        reasoning: {
          factors: [
            {
              factor: 'Fitness Certificates',
              weight: 0.4,
              impact: this.getFitnessImpact(train),
              description: this.getFitnessDescription(train)
            },
            {
              factor: 'Job Card Status',
              weight: 0.25,
              impact: this.getJobCardImpact(train),
              description: this.getJobCardDescription(train)
            },
            {
              factor: 'Mileage Balance',
              weight: 0.2,
              impact: this.getMileageImpact(train),
              description: this.getMileageDescription(train)
            },
            {
              factor: 'Branding SLA',
              weight: 0.1,
              impact: this.getBrandingImpact(train),
              description: this.getBrandingDescription(train)
            },
            {
              factor: 'Cleaning Availability',
              weight: 0.05,
              impact: this.getCleaningImpact(train),
              description: this.getCleaningDescription(train)
            }
          ],
          constraints: this.getConstraintStatus(train),
          tradeoffs: this.getTradeoffs(train, decision)
        },
        confidence: decision.confidence,
        alternatives: this.getAlternatives(train, decision)
      };
      
      explanations.push(explanation);
    }
    
    return explanations;
  }

  // Helper methods for explanations
  private getFitnessImpact(train: Train): 'positive' | 'negative' | 'neutral' {
    const now = new Date();
    const rollingStockExpiry = new Date(train.fitness.rollingStockExpiry);
    const signallingExpiry = new Date(train.fitness.signallingExpiry);
    const telecomExpiry = new Date(train.fitness.telecomExpiry);
    
    if (rollingStockExpiry > now && signallingExpiry > now && telecomExpiry > now) {
      return 'positive';
    } else if (rollingStockExpiry <= now || signallingExpiry <= now || telecomExpiry <= now) {
      return 'negative';
    }
    return 'neutral';
  }

  private getFitnessDescription(train: Train): string {
    const now = new Date();
    const rollingStockExpiry = new Date(train.fitness.rollingStockExpiry);
    const signallingExpiry = new Date(train.fitness.signallingExpiry);
    const telecomExpiry = new Date(train.fitness.telecomExpiry);
    
    const daysToExpiry = Math.min(
      (rollingStockExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      (signallingExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      (telecomExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysToExpiry > 7) {
      return `All fitness certificates valid for ${Math.floor(daysToExpiry)} days`;
    } else if (daysToExpiry > 0) {
      return `Fitness certificates expire in ${Math.floor(daysToExpiry)} days - requires attention`;
    } else {
      return 'Fitness certificates expired - cannot enter service';
    }
  }

  private getJobCardImpact(train: Train): 'positive' | 'negative' | 'neutral' {
    const criticalCards = this.jobCards.filter(jc => 
      jc.trainId === train.id && 
      jc.status === 'open' && 
      jc.severity === 'critical'
    );
    
    if (criticalCards.length === 0) return 'positive';
    if (criticalCards.length > 0) return 'negative';
    return 'neutral';
  }

  private getJobCardDescription(train: Train): string {
    const openCards = this.jobCards.filter(jc => jc.trainId === train.id && jc.status === 'open');
    const criticalCards = openCards.filter(jc => jc.severity === 'critical');
    
    if (criticalCards.length === 0) {
      return `No open job cards - ready for service`;
    } else {
      return `${criticalCards.length} critical job cards open - requires maintenance`;
    }
  }

  private getMileageImpact(train: Train): 'positive' | 'negative' | 'neutral' {
    const allMileages = this.trains.map(t => t.odoKm);
    const avgMileage = allMileages.reduce((sum, m) => sum + m, 0) / allMileages.length;
    const deviation = Math.abs(train.odoKm - avgMileage);
    const threshold = avgMileage * 0.1; // 10% threshold
    
    if (deviation < threshold) return 'positive';
    if (deviation > threshold * 2) return 'negative';
    return 'neutral';
  }

  private getMileageDescription(train: Train): string {
    const allMileages = this.trains.map(t => t.odoKm);
    const avgMileage = allMileages.reduce((sum, m) => sum + m, 0) / allMileages.length;
    const deviation = train.odoKm - avgMileage;
    
    if (Math.abs(deviation) < avgMileage * 0.05) {
      return `Mileage (${train.odoKm} km) well balanced with fleet average (${Math.floor(avgMileage)} km)`;
    } else if (deviation > 0) {
      return `High mileage (${train.odoKm} km) - ${Math.floor(deviation)} km above average`;
    } else {
      return `Low mileage (${train.odoKm} km) - ${Math.floor(Math.abs(deviation))} km below average`;
    }
  }

  private getBrandingImpact(train: Train): 'positive' | 'negative' | 'neutral' {
    const branding = this.brandingSLAs.find(bs => bs.trainId === train.id);
    if (!branding) return 'neutral';
    
    const compliance = branding.hoursDelivered / branding.minHoursWeek;
    if (compliance >= 1) return 'positive';
    if (compliance < 0.8) return 'negative';
    return 'neutral';
  }

  private getBrandingDescription(train: Train): string {
    const branding = this.brandingSLAs.find(bs => bs.trainId === train.id);
    if (!branding) return 'No branding requirements';
    
    const compliance = branding.hoursDelivered / branding.minHoursWeek;
    const shortfall = branding.minHoursWeek - branding.hoursDelivered;
    
    if (compliance >= 1) {
      return `Branding SLA met (${branding.hoursDelivered}/${branding.minHoursWeek} hours)`;
    } else {
      return `Branding SLA at risk - ${Math.floor(shortfall)} hours shortfall`;
    }
  }

  private getCleaningImpact(train: Train): 'positive' | 'negative' | 'neutral' {
    const availableSlots = this.cleaningSlots.filter(cs => cs.status === 'available');
    if (availableSlots.length === 0) return 'negative';
    return 'positive';
  }

  private getCleaningDescription(train: Train): string {
    const availableSlots = this.cleaningSlots.filter(cs => cs.status === 'available');
    if (availableSlots.length === 0) {
      return 'No cleaning slots available';
    } else {
      return `${availableSlots.length} cleaning slots available`;
    }
  }

  private getConstraintStatus(train: Train) {
    return [
      {
        constraint: 'Fitness certificates valid',
        satisfied: this.areFitnessCertificatesValid(train),
        severity: 'hard' as const
      },
      {
        constraint: 'No critical job cards',
        satisfied: !this.hasCriticalJobCards(train.id),
        severity: 'hard' as const
      },
      {
        constraint: 'Bay capacity available',
        satisfied: this.isBayCapacityAvailable(),
        severity: 'soft' as const
      }
    ];
  }

  private getTradeoffs(train: Train, decision: TrainDecision) {
    const tradeoffs = [];
    
    if (decision.action === 'revenue') {
      tradeoffs.push({
        aspect: 'Service availability',
        current: 1,
        alternative: 0.5,
        explanation: 'Revenue service provides maximum passenger capacity'
      });
    } else if (decision.action === 'standby') {
      tradeoffs.push({
        aspect: 'Operational flexibility',
        current: 0.8,
        alternative: 0.3,
        explanation: 'Standby provides flexibility for disruptions'
      });
    }
    
    return tradeoffs;
  }

  private getAlternatives(train: Train, decision: TrainDecision) {
    const alternatives = [];
    
    if (decision.action !== 'revenue') {
      alternatives.push({
        action: 'revenue',
        score: decision.score * 0.8,
        reason: 'Could enter revenue service but with lower confidence'
      });
    }
    
    if (decision.action !== 'standby') {
      alternatives.push({
        action: 'standby',
        score: decision.score * 0.6,
        reason: 'Could be held on standby for flexibility'
      });
    }
    
    return alternatives;
  }

  // Utility methods
  private hasCriticalJobCards(trainId: string): boolean {
    return this.jobCards.some(jc => 
      jc.trainId === trainId && 
      jc.status === 'open' && 
      jc.severity === 'critical'
    );
  }

  private hasFitnessConflicts(trainId: string): boolean {
    const train = this.trains.find(t => t.id === trainId);
    if (!train) return false;
    
    const now = new Date();
    const rollingStockExpiry = new Date(train.fitness.rollingStockExpiry);
    const signallingExpiry = new Date(train.fitness.signallingExpiry);
    const telecomExpiry = new Date(train.fitness.telecomExpiry);
    
    return rollingStockExpiry <= now || signallingExpiry <= now || telecomExpiry <= now;
  }

  private hasJobCardConflicts(trainId: string): boolean {
    return this.hasCriticalJobCards(trainId);
  }

  private hasBrandingConflicts(trainId: string): boolean {
    const branding = this.brandingSLAs.find(bs => bs.trainId === trainId);
    if (!branding) return false;
    
    const compliance = branding.hoursDelivered / branding.minHoursWeek;
    return compliance < 0.8;
  }

  private areFitnessCertificatesValid(train: Train): boolean {
    const now = new Date();
    const rollingStockExpiry = new Date(train.fitness.rollingStockExpiry);
    const signallingExpiry = new Date(train.fitness.signallingExpiry);
    const telecomExpiry = new Date(train.fitness.telecomExpiry);
    
    return rollingStockExpiry > now && signallingExpiry > now && telecomExpiry > now;
  }

  private isBayCapacityAvailable(): boolean {
    const totalCapacity = this.stablingBays.reduce((sum, bay) => sum + bay.capacity, 0);
    const totalOccupied = this.stablingBays.reduce((sum, bay) => sum + bay.occupied, 0);
    return totalOccupied < totalCapacity;
  }

  private findOptimalBay(trainId: string, action: string): string | undefined {
    // Simplified bay assignment logic
    const availableBays = this.stablingBays.filter(bay => bay.occupied < bay.capacity);
    if (availableBays.length === 0) return undefined;
    
    // Return the bay with lowest shunt cost
    return availableBays.reduce((best, current) => 
      current.shuntCost < best.shuntCost ? current : best
    ).id;
  }

  private calculateTurnoutTime(trainId: string, action: string): string {
    // Simplified turnout calculation
    const baseTime = new Date();
    baseTime.setHours(5, 30, 0, 0); // 5:30 AM base time
    
    if (action === 'revenue') {
      baseTime.setMinutes(baseTime.getMinutes() + 15); // 15 min prep time
    } else if (action === 'standby') {
      baseTime.setMinutes(baseTime.getMinutes() + 30); // 30 min standby prep
    } else {
      baseTime.setMinutes(baseTime.getMinutes() + 60); // 60 min maintenance prep
    }
    
    return baseTime.toISOString();
  }

  private calculateTotalShunting(decisions: TrainDecision[]): number {
    // Simplified shunting calculation
    return decisions.filter(d => d.bayAssignment).length * 2; // 2 moves per train
  }

  private calculateMileageVariance(decisions: TrainDecision[]): number {
    const revenueTrains = decisions.filter(d => d.action === 'revenue');
    if (revenueTrains.length === 0) return 0;
    
    const mileages = revenueTrains.map(d => {
      const train = this.trains.find(t => t.id === d.trainId);
      return train?.odoKm || 0;
    });
    
    const avg = mileages.reduce((sum, m) => sum + m, 0) / mileages.length;
    const variance = mileages.reduce((sum, m) => sum + Math.pow(m - avg, 2), 0) / mileages.length;
    return Math.sqrt(variance);
  }

  private calculateBrandingCompliance(decisions: TrainDecision[]): number {
    const revenueTrains = decisions.filter(d => d.action === 'revenue');
    if (revenueTrains.length === 0) return 1;
    
    let totalCompliance = 0;
    let brandedTrains = 0;
    
    for (const decision of revenueTrains) {
      const branding = this.brandingSLAs.find(bs => bs.trainId === decision.trainId);
      if (branding) {
        totalCompliance += branding.hoursDelivered / branding.minHoursWeek;
        brandedTrains++;
      }
    }
    
    return brandedTrains > 0 ? totalCompliance / brandedTrains : 1;
  }
}
