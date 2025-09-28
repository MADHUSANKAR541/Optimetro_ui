# AI-Driven Train Induction Planning & Scheduling System

## Overview

This system implements a comprehensive AI-driven solution for Kochi Metro Rail Limited (KMRL) that transforms nightly train induction planning from an ad-hoc, error-prone process into a transparent, optimized, and resilient operation.

## 🎯 Key Features

### 1. **Nightly AI Scheduler (23:00 IST)**
- Generates complete next-day operational plan
- Multi-objective optimization considering 6 interdependent variables
- Explainable AI decisions with human-readable reasoning
- Real-time constraint satisfaction and conflict detection

### 2. **Real-Time Operations Copilot**
- Natural language interface for operational requests
- Context-aware decision making
- Preview → Confirm → Commit workflow
- Automatic rollback and audit capabilities

### 3. **Rider Experience & Peak Management**
- AI-driven demand shaping
- Personalized peak shift offers
- Reward system for flexible travel
- Privacy-preserving analytics

### 4. **Explainable AI (Groq-powered)**
- Per-train decision explanations
- Factor analysis and constraint reasoning
- Alternative scenario evaluation
- Confidence scoring

## 🏗️ System Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    AI-Driven System                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Induction     │  │   Operations    │  │    Peak     │ │
│  │   Planning      │  │   Copilot       │  │ Management  │ │
│  │                 │  │                 │  │             │ │
│  │ • Multi-objective│  │ • Natural Lang │  │ • Demand    │ │
│  │   Optimization  │  │ • Context Aware │  │   Shaping   │ │
│  │ • Constraint   │  │ • Preview/Commit│  │ • Rewards   │ │
│  │   Satisfaction  │  │ • Rollback      │  │ • Analytics │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Trains    │ │  Job Cards  │ │ Branding   │          │
│  │   Status    │ │   Status    │ │   SLAs     │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  Cleaning   │ │  Stabling   │ │   Trip     │          │
│  │   Slots     │ │    Bays     │ │   Blocks   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Data Models

#### Enhanced Train Model
```typescript
interface Train {
  id: string;
  trainNumber: string;
  status: 'revenue' | 'standby' | 'IBL' | 'maintenance';
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
  };
  jobCards: number;
  conflicts: number;
  brandingTag?: string;
  consist: string;
  odoKm: number;
  lastServiceAt: string;
}
```

#### AI Decision Model
```typescript
interface TrainDecision {
  trainId: string;
  action: 'revenue' | 'standby' | 'IBL';
  score: number;
  reason: string;
  constraints: string[];
  bayAssignment?: string;
  tripAssignments?: string[];
  estimatedTurnout?: string;
  confidence: number;
}
```

## 🚀 Implementation

### 1. AI Optimization Engine

**File**: `src/lib/aiOptimization.ts`

```typescript
const engine = new AIOptimizationEngine(
  config,
  trains,
  jobCards,
  brandingSLAs,
  cleaningSlots,
  stablingBays,
  tripBlocks
);

const plan = await engine.generateInductionPlan();
```

**Key Features**:
- Multi-factor scoring (fitness, job cards, mileage, branding, cleaning)
- Constraint optimization using OR-Tools
- Explainable AI reasoning
- Real-time conflict detection

### 2. Operations Copilot

**File**: `src/lib/copilot.ts`

```typescript
const copilot = new OperationsCopilot(trains, jobCards, brandingSLAs, stablingBays, tripBlocks);

const response = await copilot.processRequest({
  prompt: "Withdraw train 01 due to technical issue",
  context: { affectedTrains: ["01"], affectedStations: [], timeWindow: {...} }
});
```

**Supported Commands**:
- `withdraw` - Remove train from service
- `short_turn` - Terminate train early
- `gap_fill` - Fill service gap with standby
- `inject_standby` - Bring standby train into service
- `skip_stop` - Skip station stops

### 3. Peak Management System

**File**: `src/lib/peakManagement.ts`

```typescript
const peakSystem = new PeakManagementSystem();

// Analyze rider behavior
const offer = await peakSystem.analyzeRiderBehavior(userId, {
  origin: "Station A",
  destination: "Station B", 
  intendedTime: "2024-01-15T08:30:00Z"
});

// Process offer response
const result = await peakSystem.processOfferResponse(offerId, accepted);
```

## 📊 API Endpoints

### Induction Planning
```http
POST /api/ai/induction
Content-Type: application/json

{
  "config": {
    "weights": {
      "feasibility": 0.4,
      "shunting": 0.2,
      "mileageBalance": 0.2,
      "branding": 0.1,
      "cleaning": 0.1
    },
    "constraints": {
      "maxRun": 20,
      "maxStandby": 5,
      "maxMaintenance": 5,
      "minHeadway": 6,
      "maxShunting": 10
    }
  },
  "trains": [...],
  "jobCards": [...],
  "brandingSLAs": [...],
  "cleaningSlots": [...],
  "stablingBays": [...],
  "tripBlocks": [...]
}
```

### Operations Copilot
```http
POST /api/ai/copilot
Content-Type: application/json

{
  "prompt": "Withdraw train 01 due to technical issue",
  "context": {
    "affectedTrains": ["01"],
    "affectedStations": [],
    "timeWindow": {
      "start": "2024-01-15T21:00:00Z",
      "end": "2024-01-16T23:00:00Z"
    }
  }
}
```

### Peak Management
```http
POST /api/ai/peak-management
Content-Type: application/json

{
  "action": "analyze_behavior",
  "userId": "user123",
  "data": {
    "origin": "Station A",
    "destination": "Station B",
    "intendedTime": "2024-01-15T08:30:00Z"
  }
}
```

## 🎛️ Dashboard Interface

### AI Dashboard Components

**File**: `src/components/ai/AIDashboard.tsx`

The dashboard provides four main tabs:

1. **Induction Planning** - Generate and review nightly plans
2. **Operations Copilot** - Natural language operations interface  
3. **Peak Management** - Rider engagement and demand shaping
4. **Analytics** - System performance and operational insights

### Key Features:
- Real-time plan generation
- Interactive decision review
- Natural language copilot interface
- Peak management analytics
- System performance metrics

## 🔧 Configuration

### Optimization Weights
```typescript
const config: OptimizationConfig = {
  weights: {
    feasibility: 0.4,      // Fitness certificates, job cards
    shunting: 0.2,         // Minimize depot movements
    mileageBalance: 0.2,   // Equalize train usage
    branding: 0.1,         // SLA compliance
    cleaning: 0.1          // Cleaning slot availability
  },
  constraints: {
    maxRun: 20,             // Maximum revenue trains
    maxStandby: 5,        // Maximum standby trains
    maxMaintenance: 5,    // Maximum maintenance trains
    minHeadway: 6,        // Minimum headway (minutes)
    maxShunting: 10       // Maximum shunting moves
  }
};
```

## 📈 Success Metrics

### Planning Efficiency
- **Planning Time**: ~2h → ≤15 min nightly
- **Reschedule Latency**: ≤30 s (prompt → commit)
- **Plan Quality**: ≥99.8% constraint satisfaction

### Operational Impact
- **Punctuality**: Sustain/improve >99.5%
- **Availability**: +10% effective availability
- **Energy Savings**: Measurable reduction in shunting moves
- **Maintenance**: Mileage variance tightening week-over-week

### Rider Experience
- **Peak Reduction**: 20-30% reduction in wait-time spikes
- **Demand Shaping**: % trips shifted off-peak
- **Engagement**: Rider participation in peak shifting

## 🔒 Security & Privacy

### Data Protection
- User ID hashing for privacy
- Consent-based data collection
- Retention limits and encryption
- RBAC/MFA for admin access

### Audit & Compliance
- Tamper-evident audit logs
- Two-phase commit for changes
- Rollback capabilities
- Real-time monitoring

## 🚀 Deployment

### Prerequisites
- Node.js 18+
- PostgreSQL with PostGIS
- Redis for caching
- OR-Tools for optimization

### Installation
```bash
npm install
npm run build
npm run start
```

### Environment Variables
```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
GROQ_API_KEY=your_groq_key
NEXTAUTH_SECRET=your_secret
```

## 📚 Usage Examples

### Generate Nightly Plan
```typescript
const plan = await fetch('/api/ai/induction', {
  method: 'POST',
  body: JSON.stringify({ config, trains, jobCards, ... })
});
```

### Process Copilot Request
```typescript
const response = await fetch('/api/ai/copilot', {
  method: 'POST', 
  body: JSON.stringify({
    prompt: "Short turn train 05 at Station X due to obstruction",
    context: { affectedTrains: ["05"], affectedStations: ["X"] }
  })
});
```

### Analyze Rider Behavior
```typescript
const offer = await fetch('/api/ai/peak-management', {
  method: 'POST',
  body: JSON.stringify({
    action: 'analyze_behavior',
    userId: 'user123',
    data: { origin: 'A', destination: 'B', intendedTime: '08:30' }
  })
});
```

## 🔮 Future Enhancements

1. **Machine Learning Integration**
   - Predictive maintenance models
   - Demand forecasting improvements
   - Anomaly detection

2. **Advanced Analytics**
   - Real-time performance dashboards
   - Predictive insights
   - Automated reporting

3. **Mobile Applications**
   - Rider mobile app with peak shifting
   - Operations mobile interface
   - Real-time notifications

4. **Integration Expansion**
   - Weather data integration
   - Event calendar integration
   - External system APIs

---

This AI-driven system transforms KMRL's operations from reactive to proactive, providing transparent, optimized, and resilient train induction planning with real-time agility and explainable decisions.
