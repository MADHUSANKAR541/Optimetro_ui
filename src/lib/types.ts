export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'commuter';
  avatar?: string;
}

export interface Train {
  id: string;
  trainNumber: string;
  status: 'revenue' | 'standby' | 'IBL' | 'maintenance';
  mileage: number;
  lastService: string;
  nextService: string;
  fitness: {
    rollingStock: boolean;
    signalling: boolean;
    telecom: boolean;
    rollingStockExpiry: string;
    signallingExpiry: string;
    telecomExpiry: string;
  };
  position?: {
    bayId?: string;
    lat?: number;
    lng?: number;
    x?: number;
    y?: number;
  };
  jobCards: number;
  conflicts: number;
  brandingTag?: string;
  consist: string; // 4-car trainset
  odoKm: number; // odometer reading
  lastServiceAt: string;
}

export interface JobCard {
  id: string;
  trainId: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  dueDate: string;
  createdAt: string;
  system: 'rolling_stock' | 'signalling' | 'telecom' | 'HVAC' | 'brake' | 'bogie';
  severity: 'low' | 'medium' | 'high' | 'critical';
  openedAt: string;
  mustClearBy?: string;
}

export interface BrandingContract {
  id: string;
  advertiser: string;
  contractValue: number;
  exposureHours: number;
  hoursDelivered: number;
  slaRisk: 'low' | 'medium' | 'high';
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'pending';
  campaignId: string;
  trainId: string;
  minHoursWeek: number;
}

export interface StablingBay {
  id: string;
  bayNumber: string;
  capacity: number;
  occupied: number;
  trainIds: string[];
  estimatedTurnout: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error';
  affectedLines: string[];
  affectedStations: string[];
  startTime: string;
  endTime?: string;
  status: 'active' | 'resolved';
}

export interface Journey {
  id: string;
  from: string;
  to: string;
  steps: JourneyStep[];
  totalTime: number;
  totalFare: number;
  createdAt: string;
  departureTime?: string;
  arrivalTime?: string;
}

export interface JourneyStep {
  type: 'metro' | 'bus' | 'walk';
  from: string;
  to: string;
  duration: number;
  fare?: number;
  line?: string;
  platform?: string;
  trainId?: string;
  departureTime?: string;
  arrivalTime?: string;
}

export interface KPI {
  date: string;
  punctuality: number;
  energyUsage: number;
  slaBreaches: number;
  mtbf: number;
  waitTimeReduction: number;
}

export interface Trip {
  id: string;
  from: string;
  to: string;
  date: string;
  fare: number;
  duration: number;
  status: 'completed' | 'cancelled';
}

export interface Ticket {
  id: string;
  type: 'single' | 'daily' | 'monthly';
  validFrom: string;
  validTo: string;
  fare: number;
  status: 'active' | 'expired' | 'used';
  qrCode: string;
}

export interface OptimizationResult {
  trainId: string;
  action: 'revenue' | 'standby' | 'IBL';
  score: number;
  reason: string;
  constraints: string[];
}

export interface Conflict {
  id: string;
  type: 'fitness' | 'jobcard' | 'branding';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedTrains: string[];
  resolution?: string;
  status: 'open' | 'resolved';
}

export interface MaintenanceRecord {
  id: string;
  trainId: string;
  type: 'preventive' | 'corrective' | 'emergency';
  description: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  assignedTo: string;
  scheduledDate: string;
  completedDate?: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  lineId: string;
  facilities: string[];
  accessibility: boolean;
  firstTrain: string;
  lastTrain: string;
}

export interface MetroLine {
  id: string;
  name: string;
  color: string;
  stations: string[];
  coordinates: [number, number][];
}

export interface RouteStep {
  type: 'metro' | 'bus' | 'walk';
  from: string;
  to: string;
  duration: number;
  fare?: number;
  line?: string;
  platform?: string;
  coordinates: [number, number][];
}

export interface Route {
  id: string;
  from: string;
  to: string;
  steps: RouteStep[];
  totalTime: number;
  totalFare: number;
  polyline: [number, number][];
  createdAt: string;
}

export interface MapAlert {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error';
  type: 'maintenance' | 'crowding' | 'weather' | 'technical';
  lat: number;
  lng: number;
  affectedLines: string[];
  affectedStations: string[];
  startTime: string;
  endTime?: string;
  status: 'active' | 'resolved';
}

export interface DepotBay {
  id: string;
  bayNumber: string;
  x: number;
  y: number;
  capacity: number;
  occupied: number;
  trainIds: string[];
  estimatedTurnout: string;
}

export interface DepotSchematic {
  id: string;
  name: string;
  bounds: [[number, number], [number, number]];
  bays: DepotBay[];
  tracks: [number, number][][];
  entryPoints: [number, number][];
  exitPoints: [number, number][];
}

export interface TrainRake {
  id: string;
  trainNumber: string;
  status: 'revenue' | 'standby' | 'IBL' | 'maintenance';
  mileage: number;
  fitness: {
    rollingStock: boolean;
    signalling: boolean;
    telecom: boolean;
  };
  position?: {
    bayId?: string;
    lat?: number;
    lng?: number;
    x?: number;
    y?: number;
  };
  jobCards: number;
  conflicts: number;
}

export interface ShuntingMove {
  trainId: string;
  from: string;
  to: string;
  estimatedTime: number;
  priority: 'high' | 'medium' | 'low';
}

export interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  type: 'stations' | 'lines' | 'alerts' | 'routes' | 'depot';
}

export interface MapState {
  center: [number, number];
  zoom: number;
  layers: MapLayer[];
  selectedStation?: string;
  selectedRoute?: string;
  selectedTrain?: string;
  selectedAlert?: string;
}

// AI-Driven Train Induction System Interfaces

export interface CleaningSlot {
  id: string;
  depotId: string;
  bay: string;
  start: string;
  end: string;
  manpower: number;
  duration: number; // in minutes
  status: 'available' | 'occupied' | 'reserved';
}

export interface BrandingSLA {
  campaignId: string;
  trainId: string;
  minHoursWeek: number;
  hoursDelivered: number;
  shortfall: number;
  penalty: number;
}

export interface StablingBay {
  id: string;
  bayNumber: string;
  x: number;
  y: number;
  capacity: number;
  occupied: number;
  trainIds: string[];
  estimatedTurnout: string;
  depotId: string;
  adjacency: string[]; // adjacent bay IDs
  shuntCost: number; // cost to move to/from this bay
}

export interface TripBlock {
  tripId: string;
  line: string;
  origin: string;
  dest: string;
  depPlanned: string;
  arrPlanned: string;
  headway: number; // minimum headway in minutes
  trainId?: string; // assigned train
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
}

export interface InductionPlan {
  id: string;
  modelVersion: string;
  objectiveWeights: {
    feasibility: number;
    shunting: number;
    mileageBalance: number;
    branding: number;
    cleaning: number;
  };
  seed: number;
  generatedAt: string;
  decisions: TrainDecision[];
  conflicts: Conflict[];
  metrics: {
    totalShunting: number;
    mileageVariance: number;
    brandingCompliance: number;
    constraintViolations: number;
  };
}

export interface TrainDecision {
  trainId: string;
  action: 'revenue' | 'standby' | 'IBL';
  score: number;
  reason: string;
  constraints: string[];
  bayAssignment?: string;
  tripAssignments?: string[];
  estimatedTurnout?: string;
  confidence: number; // 0-1
}

export interface PlanDiff {
  planId: string;
  changes: {
    trainId: string;
    oldAction: string;
    newAction: string;
    reason: string;
    timestamp: string;
  }[];
  rollbackData: any;
}

// Real-time Operations Copilot
export interface CopilotRequest {
  id: string;
  prompt: string;
  context: {
    affectedTrains: string[];
    affectedStations: string[];
    timeWindow: {
      start: string;
      end: string;
    };
  };
  timestamp: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface CopilotResponse {
  requestId: string;
  preview: {
    changes: TrainDecision[];
    metrics: {
      impact: string;
      feasibility: number;
      estimatedDelay: number;
    };
    reasoning: string;
    modifiedSchedule?: any[]; // Optional modified schedule for plan integration
  };
  alternatives: {
    option: string;
    description: string;
    tradeoffs: string[];
  }[];
  confidence: number;
  requiresApproval: boolean;
  modifiedSchedule?: any[]; // Optional modified schedule for plan integration
}

// Rider Experience & Peak Management
export interface RiderProfile {
  userId: string;
  hashedId: string; // for privacy
  typicalTravelTimes: {
    origin: string;
    destination: string;
    preferredTimes: string[];
  }[];
  flexibilityScore: number; // 0-1
  rewardPoints: number;
  consentFlags: {
    peakShifting: boolean;
    dataAnalytics: boolean;
    notifications: boolean;
  };
}

export interface PeakShiftOffer {
  id: string;
  userId: string;
  originalTime: string;
  suggestedTime: string;
  timeShift: number; // minutes
  rewardPoints: number;
  reason: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface RewardTransaction {
  id: string;
  userId: string;
  type: 'peak_shift' | 'compliance' | 'bonus';
  points: number;
  description: string;
  timestamp: string;
  verified: boolean;
}

// Explainable AI
export interface AIExplanation {
  trainId: string;
  decision: string;
  reasoning: {
    factors: {
      factor: string;
      weight: number;
      impact: 'positive' | 'negative' | 'neutral';
      description: string;
    }[];
    constraints: {
      constraint: string;
      satisfied: boolean;
      severity: 'hard' | 'soft';
    }[];
    tradeoffs: {
      aspect: string;
      current: number;
      alternative: number;
      explanation: string;
    }[];
  };
  confidence: number;
  alternatives: {
    action: string;
    score: number;
    reason: string;
  }[];
}

// Optimization Engine
export interface OptimizationConfig {
  weights: {
    feasibility: number;
    shunting: number;
    mileageBalance: number;
    branding: number;
    cleaning: number;
  };
  constraints: {
    maxRun: number;
    maxStandby: number;
    maxMaintenance: number;
    minHeadway: number;
    maxShunting: number;
  };
  timeWindow: {
    start: string;
    end: string;
  };
  seed?: number;
}

export interface OptimizationResponse {
  status: 'optimal' | 'feasible' | 'infeasible';
  objectiveValue: number;
  solveTime: number;
  decisions: TrainDecision[];
  conflicts: Conflict[];
  metrics: {
    totalShunting: number;
    mileageVariance: number;
    brandingCompliance: number;
    constraintViolations: number;
  };
  explanation: AIExplanation[];
}
