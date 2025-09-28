import { 
  CopilotRequest, 
  CopilotResponse, 
  TrainDecision, 
  Train,
  JobCard,
  BrandingSLA,
  StablingBay,
  TripBlock
} from './types';

export class OperationsCopilot {
  private trains: Train[];
  private jobCards: JobCard[];
  private brandingSLAs: BrandingSLA[];
  private stablingBays: StablingBay[];
  private tripBlocks: TripBlock[];

  constructor(
    trains: Train[],
    jobCards: JobCard[],
    brandingSLAs: BrandingSLA[],
    stablingBays: StablingBay[],
    tripBlocks: TripBlock[]
  ) {
    this.trains = trains;
    this.jobCards = jobCards;
    this.brandingSLAs = brandingSLAs;
    this.stablingBays = stablingBays;
    this.tripBlocks = tripBlocks;
  }

  /**
   * Process natural language request and generate response
   */
  async processRequest(request: CopilotRequest): Promise<CopilotResponse> {
    const intent = this.parseIntent(request.prompt);
    const context = this.buildContext(request);
    
    let response: CopilotResponse;
    
    switch (intent.type) {
      case 'withdraw':
        response = await this.handleWithdrawRequest(intent, context);
        break;
      case 'short_turn':
        response = await this.handleShortTurnRequest(intent, context);
        break;
      case 'gap_fill':
        response = await this.handleGapFillRequest(intent, context);
        break;
      case 'inject_standby':
        response = await this.handleInjectStandbyRequest(intent, context);
        break;
      case 'skip_stop':
        response = await this.handleSkipStopRequest(intent, context);
        break;
      default:
        response = await this.handleGenericRequest(intent, context);
    }
    
    return response;
  }

  /**
   * Process request with plan integration for schedule modifications
   */
  async processRequestWithPlan(request: CopilotRequest): Promise<CopilotResponse> {
    const intent = this.parseIntent(request.prompt);
    const context = this.buildContextWithPlan(request);
    
    let response: CopilotResponse;
    
    switch (intent.type) {
      case 'withdraw':
        response = await this.handleWithdrawWithPlan(intent, context);
        break;
      case 'short_turn':
        response = await this.handleShortTurnWithPlan(intent, context);
        break;
      case 'gap_fill':
        response = await this.handleGapFillWithPlan(intent, context);
        break;
      case 'inject_standby':
        response = await this.handleInjectStandbyWithPlan(intent, context);
        break;
      case 'skip_stop':
        response = await this.handleSkipStopWithPlan(intent, context);
        break;
      default:
        response = await this.handleGenericRequest(intent, context);
    }
    
    return response;
  }

  /**
   * Parse natural language intent from prompt
   */
  private parseIntent(prompt: string): {
    type: 'withdraw' | 'short_turn' | 'gap_fill' | 'inject_standby' | 'skip_stop' | 'generic';
    entities: {
      trains?: string[];
      stations?: string[];
      time?: string;
      reason?: string;
    };
    confidence: number;
  } {
    const lowerPrompt = prompt.toLowerCase();
    
    // Withdraw patterns
    if (lowerPrompt.includes('withdraw') || lowerPrompt.includes('remove') || lowerPrompt.includes('take out')) {
      const trains = this.extractTrainIds(prompt);
      return {
        type: 'withdraw',
        entities: { trains, reason: this.extractReason(prompt) },
        confidence: 0.9
      };
    }
    
    // Short turn patterns
    if (lowerPrompt.includes('short turn') || lowerPrompt.includes('terminate early') || lowerPrompt.includes('turn back')) {
      const trains = this.extractTrainIds(prompt);
      const stations = this.extractStationNames(prompt);
      return {
        type: 'short_turn',
        entities: { trains, stations, reason: this.extractReason(prompt) },
        confidence: 0.9
      };
    }
    
    // Gap fill patterns
    if (lowerPrompt.includes('gap') || lowerPrompt.includes('fill') || lowerPrompt.includes('replace')) {
      const trains = this.extractTrainIds(prompt);
      return {
        type: 'gap_fill',
        entities: { trains, reason: this.extractReason(prompt) },
        confidence: 0.8
      };
    }
    
    // Inject standby patterns
    if (lowerPrompt.includes('inject') || lowerPrompt.includes('add') || lowerPrompt.includes('bring in')) {
      const trains = this.extractTrainIds(prompt);
      return {
        type: 'inject_standby',
        entities: { trains, reason: this.extractReason(prompt) },
        confidence: 0.8
      };
    }
    
    // Skip stop patterns
    if (lowerPrompt.includes('skip') || lowerPrompt.includes('bypass') || lowerPrompt.includes('miss')) {
      const stations = this.extractStationNames(prompt);
      return {
        type: 'skip_stop',
        entities: { stations, reason: this.extractReason(prompt) },
        confidence: 0.8
      };
    }
    
    return {
      type: 'generic',
      entities: { reason: this.extractReason(prompt) },
      confidence: 0.5
    };
  }

  /**
   * Build context from request
   */
  private buildContext(request: CopilotRequest) {
    return {
      affectedTrains: request.context.affectedTrains.map(id => 
        this.trains.find(t => t.id === id)
      ).filter(Boolean),
      affectedStations: request.context.affectedStations,
      timeWindow: request.context.timeWindow,
      currentPlan: this.getCurrentPlan()
    };
  }

  /**
   * Handle train withdrawal request
   */
  private async handleWithdrawRequest(intent: any, context: any): Promise<CopilotResponse> {
    const trainId = intent.entities.trains?.[0];
    if (!trainId) {
      return this.createErrorResponse('No train specified for withdrawal');
    }
    
    const train = this.trains.find(t => t.id === trainId);
    if (!train) {
      return this.createErrorResponse(`Train ${trainId} not found`);
    }
    
    // Find replacement from standby
    const standbyTrains = this.trains.filter(t => 
      t.status === 'standby' && 
      this.isTrainReadyForService(t)
    );
    
    if (standbyTrains.length === 0) {
      return this.createErrorResponse('No standby trains available for replacement');
    }
    
    const replacement = standbyTrains[0]; // Select best standby train
    
    const changes: TrainDecision[] = [
      {
        trainId,
        action: 'standby',
        score: 0,
        reason: `Withdrawn due to: ${intent.entities.reason || 'operational requirement'}`,
        constraints: [],
        confidence: 0.9
      },
      {
        trainId: replacement.id,
        action: 'revenue',
        score: 0.8,
        reason: `Replacement for withdrawn train ${trainId}`,
        constraints: [],
        confidence: 0.8
      }
    ];
    
    return {
      requestId: `req_${Date.now()}`,
      preview: {
        changes,
        metrics: {
          impact: 'Service maintained with standby replacement',
          feasibility: 0.9,
          estimatedDelay: 5 // 5 minutes delay
        },
        reasoning: `Withdrawing ${trainId} and replacing with standby train ${replacement.id}. Service continuity maintained.`
      },
      alternatives: [
        {
          option: 'Cancel service',
          description: 'Cancel the affected trip and adjust headways',
          tradeoffs: ['Reduced service frequency', 'Potential passenger inconvenience']
        },
        {
          option: 'Delay withdrawal',
          description: 'Wait for next scheduled maintenance window',
          tradeoffs: ['Operational risk continues', 'May affect other services']
        }
      ],
      confidence: 0.9,
      requiresApproval: true
    };
  }

  /**
   * Handle short turn request
   */
  private async handleShortTurnRequest(intent: any, context: any): Promise<CopilotResponse> {
    const trainId = intent.entities.trains?.[0];
    const station = intent.entities.stations?.[0];
    
    if (!trainId) {
      return this.createErrorResponse('No train specified for short turn');
    }
    
    const train = this.trains.find(t => t.id === trainId);
    if (!train) {
      return this.createErrorResponse(`Train ${trainId} not found`);
    }
    
    // Find affected trips
    const affectedTrips = this.tripBlocks.filter(trip => 
      trip.trainId === trainId && 
      trip.status === 'scheduled'
    );
    
    const changes: TrainDecision[] = [
      {
        trainId,
        action: 'revenue',
        score: 0.7,
        reason: `Short turn at ${station || 'intermediate station'} due to: ${intent.entities.reason || 'operational requirement'}`,
        constraints: ['Modified service pattern'],
        confidence: 0.8
      }
    ];
    
    return {
      requestId: `req_${Date.now()}`,
      preview: {
        changes,
        metrics: {
          impact: `Service will terminate early at ${station || 'designated station'}`,
          feasibility: 0.8,
          estimatedDelay: 2 // 2 minutes delay
        },
        reasoning: `Short turning ${trainId} at ${station || 'intermediate station'}. Passengers will need to transfer to next service.`
      },
      alternatives: [
        {
          option: 'Continue to destination',
          description: 'Maintain full service to original destination',
          tradeoffs: ['Operational risk continues', 'Potential for further delays']
        },
        {
          option: 'Cancel service',
          description: 'Cancel the entire trip',
          tradeoffs: ['No service provided', 'Passengers need alternative transport']
        }
      ],
      confidence: 0.8,
      requiresApproval: true
    };
  }

  /**
   * Handle gap fill request
   */
  private async handleGapFillRequest(intent: any, context: any): Promise<CopilotResponse> {
    const standbyTrains = this.trains.filter(t => 
      t.status === 'standby' && 
      this.isTrainReadyForService(t)
    );
    
    if (standbyTrains.length === 0) {
      return this.createErrorResponse('No standby trains available for gap filling');
    }
    
    const selectedTrain = standbyTrains[0];
    
    const changes: TrainDecision[] = [
      {
        trainId: selectedTrain.id,
        action: 'revenue',
        score: 0.8,
        reason: `Gap fill service due to: ${intent.entities.reason || 'service disruption'}`,
        constraints: [],
        confidence: 0.8
      }
    ];
    
    return {
      requestId: `req_${Date.now()}`,
      preview: {
        changes,
        metrics: {
          impact: 'Service gap filled with standby train',
          feasibility: 0.9,
          estimatedDelay: 3 // 3 minutes delay
        },
        reasoning: `Injecting standby train ${selectedTrain.id} to fill service gap. Headway will be restored.`
      },
      alternatives: [
        {
          option: 'Adjust headways',
          description: 'Increase headways on remaining services',
          tradeoffs: ['Longer wait times', 'Reduced service frequency']
        },
        {
          option: 'Cancel affected trips',
          description: 'Cancel trips to maintain headways',
          tradeoffs: ['Service reduction', 'Passenger inconvenience']
        }
      ],
      confidence: 0.9,
      requiresApproval: true
    };
  }

  /**
   * Handle inject standby request
   */
  private async handleInjectStandbyRequest(intent: any, context: any): Promise<CopilotResponse> {
    return this.handleGapFillRequest(intent, context); // Similar logic
  }

  /**
   * Handle skip stop request
   */
  private async handleSkipStopRequest(intent: any, context: any): Promise<CopilotResponse> {
    const station = intent.entities.stations?.[0];
    
    if (!station) {
      return this.createErrorResponse('No station specified for skip stop');
    }
    
    const changes: TrainDecision[] = [
      {
        trainId: 'multiple',
        action: 'revenue',
        score: 0.6,
        reason: `Skip stop at ${station} due to: ${intent.entities.reason || 'operational requirement'}`,
        constraints: ['Modified stopping pattern'],
        confidence: 0.7
      }
    ];
    
    return {
      requestId: `req_${Date.now()}`,
      preview: {
        changes,
        metrics: {
          impact: `Trains will skip ${station} station`,
          feasibility: 0.8,
          estimatedDelay: 1 // 1 minute time saving
        },
        reasoning: `Skipping ${station} station. Passengers at this station will need to use alternative services.`
      },
      alternatives: [
        {
          option: 'Continue normal service',
          description: 'Maintain normal stopping pattern',
          tradeoffs: ['Operational risk continues', 'Potential for further delays']
        },
        {
          option: 'Terminate service early',
          description: 'Terminate service before the affected station',
          tradeoffs: ['Reduced service coverage', 'Passenger inconvenience']
        }
      ],
      confidence: 0.7,
      requiresApproval: true
    };
  }

  /**
   * Handle generic request
   */
  private async handleGenericRequest(intent: any, context: any): Promise<CopilotResponse> {
    return {
      requestId: `req_${Date.now()}`,
      preview: {
        changes: [],
        metrics: {
          impact: 'No specific action identified',
          feasibility: 0.5,
          estimatedDelay: 0
        },
        reasoning: 'Could not parse specific operational request. Please provide more details.'
      },
      alternatives: [
        {
          option: 'Clarify request',
          description: 'Provide more specific details about the operational requirement',
          tradeoffs: ['Requires additional information', 'May delay response']
        }
      ],
      confidence: 0.3,
      requiresApproval: false
    };
  }

  /**
   * Create error response
   */
  private createErrorResponse(message: string): CopilotResponse {
    return {
      requestId: `req_${Date.now()}`,
      preview: {
        changes: [],
        metrics: {
          impact: 'Error',
          feasibility: 0,
          estimatedDelay: 0
        },
        reasoning: message
      },
      alternatives: [],
      confidence: 0,
      requiresApproval: false
    };
  }

  /**
   * Extract train IDs from prompt
   */
  private extractTrainIds(prompt: string): string[] {
    // Pattern for KMRC format: KMRC 007, KMRC-007, etc.
    const kmrcPattern = /kmrc[-\s]*(\d+)/gi;
    const kmrcMatches = prompt.match(kmrcPattern);
    
    // Pattern for standard train format: train 01, train-01, etc.
    const trainPattern = /train[-\s]*(\d+)/gi;
    const trainMatches = prompt.match(trainPattern);
    
    // Pattern for just numbers: 007, 01, etc.
    const numberPattern = /\b(\d{2,3})\b/g;
    const numberMatches = prompt.match(numberPattern);
    
    const allMatches = [
      ...(kmrcMatches || []),
      ...(trainMatches || []),
      ...(numberMatches || [])
    ];
    
    return allMatches.map(match => {
      // Clean up the match
      let cleaned = match.replace(/kmrc[-\s]*/i, '');
      cleaned = cleaned.replace(/train[-\s]*/i, '');
      
      // If it's a KMRC format, keep the full format
      if (match.toLowerCase().includes('kmrc')) {
        return `KMRC ${cleaned}`;
      }
      
      // If it's a train format, keep as train
      if (match.toLowerCase().includes('train')) {
        return `Train ${cleaned}`;
      }
      
      // Otherwise, return as is
      return cleaned;
    });
  }

  /**
   * Extract station names from prompt
   */
  private extractStationNames(prompt: string): string[] {
    // This would integrate with your station database
    const stationPattern = /(?:at|from|to)\s+([A-Za-z\s]+?)(?:\s|$)/gi;
    const matches = prompt.match(stationPattern);
    return matches ? matches.map(m => m.replace(/(?:at|from|to)\s+/i, '').trim()) : [];
  }

  /**
   * Extract reason from prompt
   */
  private extractReason(prompt: string): string {
    const reasonPattern = /(?:due to|because|reason:)\s+(.+)/i;
    const match = prompt.match(reasonPattern);
    return match ? match[1] : 'operational requirement';
  }

  /**
   * Check if train is ready for service
   */
  private isTrainReadyForService(train: Train): boolean {
    // Check fitness certificates
    const now = new Date();
    const rollingStockExpiry = new Date(train.fitness.rollingStockExpiry);
    const signallingExpiry = new Date(train.fitness.signallingExpiry);
    const telecomExpiry = new Date(train.fitness.telecomExpiry);
    
    if (rollingStockExpiry <= now || signallingExpiry <= now || telecomExpiry <= now) {
      return false;
    }
    
    // Check for critical job cards
    const criticalCards = this.jobCards.filter(jc => 
      jc.trainId === train.id && 
      jc.status === 'open' && 
      jc.severity === 'critical'
    );
    
    if (criticalCards.length > 0) {
      return false;
    }
    
    return true;
  }

  /**
   * Get current operational plan
   */
  private getCurrentPlan(): any {
    // This would integrate with your current plan system
    return {
      revenueTrains: this.trains.filter(t => t.status === 'revenue').length,
      standbyTrains: this.trains.filter(t => t.status === 'standby').length,
      maintenanceTrains: this.trains.filter(t => t.status === 'IBL').length
    };
  }

  /**
   * Build context with plan data
   */
  private buildContextWithPlan(request: CopilotRequest) {
    return {
      affectedTrains: request.context.affectedTrains.map(id => 
        this.trains.find(t => t.id === id)
      ).filter(Boolean),
      affectedStations: request.context.affectedStations,
      timeWindow: request.context.timeWindow,
      currentPlan: (request.context as any).currentPlan,
      currentSchedule: (request.context as any).currentSchedule
    };
  }

  /**
   * Handle withdrawal with plan integration
   */
  private async handleWithdrawWithPlan(intent: any, context: any): Promise<CopilotResponse> {
    const trainId = intent.entities.trains?.[0];
    if (!trainId) {
      return this.createErrorResponse('No train specified for withdrawal');
    }

    // Find train in current schedule (handle different formats)
    const scheduledTrain = context.currentSchedule?.find((trip: any) => {
      const tripNumber = trip.trainNumber || '';
      const tripName = trip.trainName || '';
      
      // Direct match
      if (tripNumber === trainId || tripName === trainId) return true;
      
      // KMRC format matching
      if (trainId.includes('KMRC')) {
        const kmrcNumber = trainId.replace('KMRC', '').trim();
        return tripNumber.includes(kmrcNumber) || tripName.includes(kmrcNumber);
      }
      
      // Number-only matching
      if (/^\d+$/.test(trainId)) {
        return tripNumber.includes(trainId) || tripName.includes(trainId);
      }
      
      return false;
    });

    if (!scheduledTrain) {
      return this.createErrorResponse(`Train ${trainId} not found in current schedule`);
    }

    // Check if user specifically asked for replacement
    const prompt = intent.entities.reason || '';
    const userWantsReplacement = prompt.toLowerCase().includes('replace') || 
                                 prompt.toLowerCase().includes('substitute') ||
                                 prompt.toLowerCase().includes('with replacement');

    let availableTrains: any[] = [];
    
    if (userWantsReplacement) {
      // Only look for standby trains if user specifically wants replacement
      availableTrains = context.currentPlan?.filter((train: any) => 
        train.action === 'standby' || train.decision === 'standby'
      ) || [];
    }

    let modifiedSchedule: any[] = [];
    let changes: TrainDecision[] = [];
    let impact = '';
    let reasoning = '';

    if (userWantsReplacement && availableTrains.length > 0) {
      // User wants replacement and standby train is available
      const replacement = availableTrains[0];
      modifiedSchedule = this.modifySchedule(context.currentSchedule, {
        action: 'withdraw',
        trainId,
        replacement: replacement.trainId || replacement.train_id,
        reason: intent.entities.reason || 'operational requirement'
      });

      changes = [
        {
          trainId,
          action: 'standby',
          score: 0,
          reason: `Withdrawn due to: ${intent.entities.reason || 'operational requirement'}`,
          constraints: [],
          confidence: 0.9
        },
        {
          trainId: replacement.trainId || replacement.train_id,
          action: 'revenue',
          score: 0.8,
          reason: `Replacement for withdrawn train ${trainId}`,
          constraints: [],
          confidence: 0.8
        }
      ];

      impact = 'Service maintained with standby replacement';
      reasoning = `Withdrawing ${trainId} and replacing with standby train ${replacement.trainId || replacement.train_id}. Service continuity maintained.`;
    } else {
      // Simple withdrawal without replacement
      modifiedSchedule = this.modifySchedule(context.currentSchedule, {
        action: 'withdraw',
        trainId,
        reason: intent.entities.reason || 'operational requirement'
      });

      changes = [
        {
          trainId,
          action: 'standby',
          score: 0,
          reason: `Withdrawn due to: ${intent.entities.reason || 'operational requirement'}`,
          constraints: userWantsReplacement ? ['No standby trains available'] : [],
          confidence: 0.9
        }
      ];

      impact = userWantsReplacement ? 'Service cancelled - no replacement available' : 'Service cancelled - train withdrawn';
      reasoning = userWantsReplacement 
        ? `Withdrawing ${trainId}. No standby trains available for replacement, so service will be cancelled.`
        : `Withdrawing ${trainId} from service. Affected trips will be cancelled and headways adjusted.`;
    }

    return {
      requestId: `req_${Date.now()}`,
      preview: {
        changes,
        metrics: {
          impact,
          feasibility: 0.9,
          estimatedDelay: userWantsReplacement && availableTrains.length > 0 ? 5 : 0
        },
        reasoning
      },
      modifiedSchedule,
      alternatives: userWantsReplacement ? [
        {
          option: 'Cancel service',
          description: 'Cancel the affected trip and adjust headways',
          tradeoffs: ['Reduced service frequency', 'Potential passenger inconvenience']
        }
      ] : [
        {
          option: 'Find replacement',
          description: 'Look for standby train to maintain service',
          tradeoffs: ['May require operational adjustments', 'Better passenger experience']
        }
      ],
      confidence: 0.9,
      requiresApproval: true
    };
  }

  /**
   * Handle short turn with plan integration
   */
  private async handleShortTurnWithPlan(intent: any, context: any): Promise<CopilotResponse> {
    const trainId = intent.entities.trains?.[0];
    const station = intent.entities.stations?.[0];
    
    if (!trainId) {
      return this.createErrorResponse('No train specified for short turn');
    }

    const scheduledTrain = context.currentSchedule?.find((trip: any) => {
      const tripNumber = trip.trainNumber || '';
      const tripName = trip.trainName || '';
      
      // Direct match
      if (tripNumber === trainId || tripName === trainId) return true;
      
      // KMRC format matching
      if (trainId.includes('KMRC')) {
        const kmrcNumber = trainId.replace('KMRC', '').trim();
        return tripNumber.includes(kmrcNumber) || tripName.includes(kmrcNumber);
      }
      
      // Number-only matching
      if (/^\d+$/.test(trainId)) {
        return tripNumber.includes(trainId) || tripName.includes(trainId);
      }
      
      return false;
    });

    if (!scheduledTrain) {
      return this.createErrorResponse(`Train ${trainId} not found in current schedule`);
    }

    const modifiedSchedule = this.modifySchedule(context.currentSchedule, {
      action: 'short_turn',
      trainId,
      station: station || 'intermediate station',
      reason: intent.entities.reason || 'operational requirement'
    });

    const changes: TrainDecision[] = [
      {
        trainId,
        action: 'revenue',
        score: 0.7,
        reason: `Short turn at ${station || 'intermediate station'} due to: ${intent.entities.reason || 'operational requirement'}`,
        constraints: ['Modified service pattern'],
        confidence: 0.8
      }
    ];

    return {
      requestId: `req_${Date.now()}`,
      preview: {
        changes,
        metrics: {
          impact: `Service will terminate early at ${station || 'designated station'}`,
          feasibility: 0.8,
          estimatedDelay: 2
        },
        reasoning: `Short turning ${trainId} at ${station || 'intermediate station'}. Passengers will need to transfer to next service.`
      },
      alternatives: [
        {
          option: 'Continue to destination',
          description: 'Maintain full service to original destination',
          tradeoffs: ['Operational risk continues', 'Potential for further delays']
        }
      ],
      confidence: 0.8,
      requiresApproval: true,
      modifiedSchedule
    };
  }

  /**
   * Handle gap fill with plan integration
   */
  private async handleGapFillWithPlan(intent: any, context: any): Promise<CopilotResponse> {
    const availableTrains = context.currentPlan?.filter((train: any) => 
      train.action === 'standby' || train.decision === 'standby'
    ) || [];

    if (availableTrains.length === 0) {
      return this.createErrorResponse('No standby trains available for gap filling');
    }

    const selectedTrain = availableTrains[0];
    const modifiedSchedule = this.modifySchedule(context.currentSchedule, {
      action: 'gap_fill',
      trainId: selectedTrain.trainId || selectedTrain.train_id,
      reason: intent.entities.reason || 'service disruption'
    });

    const changes: TrainDecision[] = [
      {
        trainId: selectedTrain.trainId || selectedTrain.train_id,
        action: 'revenue',
        score: 0.8,
        reason: `Gap fill service due to: ${intent.entities.reason || 'service disruption'}`,
        constraints: [],
        confidence: 0.8
      }
    ];

    return {
      requestId: `req_${Date.now()}`,
      preview: {
        changes,
        metrics: {
          impact: 'Service gap filled with standby train',
          feasibility: 0.9,
          estimatedDelay: 3
        },
        reasoning: `Injecting standby train ${selectedTrain.trainId || selectedTrain.train_id} to fill service gap. Headway will be restored.`
      },
      alternatives: [
        {
          option: 'Adjust headways',
          description: 'Increase headways on remaining services',
          tradeoffs: ['Longer wait times', 'Reduced service frequency']
        }
      ],
      confidence: 0.9,
      requiresApproval: true,
      modifiedSchedule
    };
  }

  /**
   * Handle inject standby with plan integration
   */
  private async handleInjectStandbyWithPlan(intent: any, context: any): Promise<CopilotResponse> {
    return this.handleGapFillWithPlan(intent, context);
  }

  /**
   * Handle skip stop with plan integration
   */
  private async handleSkipStopWithPlan(intent: any, context: any): Promise<CopilotResponse> {
    const station = intent.entities.stations?.[0];
    
    if (!station) {
      return this.createErrorResponse('No station specified for skip stop');
    }

    const modifiedSchedule = this.modifySchedule(context.currentSchedule, {
      action: 'skip_stop',
      station,
      reason: intent.entities.reason || 'operational requirement'
    });

    const changes: TrainDecision[] = [
      {
        trainId: 'multiple',
        action: 'revenue',
        score: 0.6,
        reason: `Skip stop at ${station} due to: ${intent.entities.reason || 'operational requirement'}`,
        constraints: ['Modified stopping pattern'],
        confidence: 0.7
      }
    ];

    return {
      requestId: `req_${Date.now()}`,
      preview: {
        changes,
        metrics: {
          impact: `Trains will skip ${station} station`,
          feasibility: 0.8,
          estimatedDelay: -1 // Time saving
        },
        reasoning: `Skipping ${station} station. Passengers at this station will need to use alternative services.`
      },
      alternatives: [
        {
          option: 'Continue normal service',
          description: 'Maintain normal stopping pattern',
          tradeoffs: ['Operational risk continues', 'Potential for further delays']
        }
      ],
      confidence: 0.7,
      requiresApproval: true,
      modifiedSchedule
    };
  }

  /**
   * Modify schedule based on action
   */
  private modifySchedule(schedule: any[], action: any): any[] {
    if (!schedule || !Array.isArray(schedule)) {
      return [];
    }

    const modifiedSchedule = [...schedule];

    switch (action.action) {
      case 'withdraw':
        // Mark train as withdrawn instead of removing (handle different formats)
        return modifiedSchedule.map(trip => {
          const tripNumber = trip.trainNumber || '';
          const tripName = trip.trainName || '';
          const trainId = action.trainId;
          
          let shouldWithdraw = false;
          
          // Direct match
          if (tripNumber === trainId || tripName === trainId) {
            shouldWithdraw = true;
          }
          
          // KMRC format matching
          if (trainId.includes('KMRC')) {
            const kmrcNumber = trainId.replace('KMRC', '').trim();
            if (tripNumber.includes(kmrcNumber) || tripName.includes(kmrcNumber)) {
              shouldWithdraw = true;
            }
          }
          
          // Number-only matching
          if (/^\d+$/.test(trainId)) {
            if (tripNumber.includes(trainId) || tripName.includes(trainId)) {
              shouldWithdraw = true;
            }
          }
          
          if (shouldWithdraw) {
            return {
              ...trip,
              status: 'Withdrawn',
              aiModified: true,
              withdrawReason: action.reason || 'Operational requirement'
            };
          }
          
          return trip;
        });
      
      case 'short_turn':
        // Modify destination for short turn (handle different formats)
        return modifiedSchedule.map(trip => {
          const tripNumber = trip.trainNumber || '';
          const tripName = trip.trainName || '';
          const trainId = action.trainId;
          
          let shouldModify = false;
          
          // Direct match
          if (tripNumber === trainId || tripName === trainId) {
            shouldModify = true;
          }
          
          // KMRC format matching
          if (trainId.includes('KMRC')) {
            const kmrcNumber = trainId.replace('KMRC', '').trim();
            if (tripNumber.includes(kmrcNumber) || tripName.includes(kmrcNumber)) {
              shouldModify = true;
            }
          }
          
          // Number-only matching
          if (/^\d+$/.test(trainId)) {
            if (tripNumber.includes(trainId) || tripName.includes(trainId)) {
              shouldModify = true;
            }
          }
          
          if (shouldModify) {
            return {
              ...trip,
              destination: action.station,
              status: 'Short Turn'
            };
          }
          return trip;
        });
      
      case 'gap_fill':
        // Add new trip with standby train
        const newTrip = {
          date: new Date().toLocaleDateString(),
          trainNumber: action.trainId,
          trainName: action.trainId,
          origin: 'Depot',
          destination: 'Service',
          departure: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          arrival: new Date(Date.now() + 30 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Gap Fill',
          aiModified: true,
          aiAction: 'added',
          addReason: action.reason || 'AI optimization'
        };
        return [...modifiedSchedule, newTrip];
      
      case 'skip_stop':
        // Mark trips to skip the station
        return modifiedSchedule.map(trip => ({
          ...trip,
          skipStations: [...(trip.skipStations || []), action.station]
        }));
      
      default:
        return modifiedSchedule;
    }
  }
}

