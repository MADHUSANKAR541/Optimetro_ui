import { NextRequest, NextResponse } from 'next/server';

interface JourneyRequest {
  from: string;
  to: string;
  date?: string;
  time?: string;
}

interface JourneyStep {
  type: 'metro' | 'walking' | 'bus';
  from: string;
  to: string;
  duration: number;
  fare: number;
  line?: string;
  platform?: string;
  departureTime?: string;
  arrivalTime?: string;
  trainId?: string;
}

interface Journey {
  from: string;
  to: string;
  steps: JourneyStep[];
  totalTime: number;
  totalFare: number;
  departureTime?: string;
  arrivalTime?: string;
}

// Mock train schedule data based on admin dashboard optimization
const mockTrainSchedule = [
  {
    trainId: 'KMRL-001',
    trainName: 'Metro Express 1',
    status: 'revenue',
    schedule: [
      { station: 'Aluva', time: '06:00', platform: 'Platform 1' },
      { station: 'Pulinchodu', time: '06:05', platform: 'Platform 1' },
      { station: 'Companypady', time: '06:10', platform: 'Platform 1' },
      { station: 'Ambattukavu', time: '06:15', platform: 'Platform 1' },
      { station: 'Muttom', time: '06:20', platform: 'Platform 1' },
      { station: 'Kalamassery', time: '06:25', platform: 'Platform 1' },
      { station: 'Cochin University', time: '06:30', platform: 'Platform 1' },
      { station: 'Pathadipalam', time: '06:35', platform: 'Platform 1' },
      { station: 'Edapally', time: '06:40', platform: 'Platform 1' },
      { station: 'Changampuzha Park', time: '06:45', platform: 'Platform 1' },
      { station: 'Palarivattom', time: '06:50', platform: 'Platform 1' },
      { station: 'JLN Stadium', time: '06:55', platform: 'Platform 1' },
      { station: 'Kaloor', time: '07:00', platform: 'Platform 1' },
      { station: 'Town Hall', time: '07:05', platform: 'Platform 1' },
      { station: 'Maharaja\'s College', time: '07:10', platform: 'Platform 1' },
      { station: 'Ernakulam South', time: '07:15', platform: 'Platform 1' },
      { station: 'Kadavanthra', time: '07:20', platform: 'Platform 1' },
      { station: 'Elamkulam', time: '07:25', platform: 'Platform 1' },
      { station: 'Vytilla', time: '07:30', platform: 'Platform 1' },
      { station: 'Thykoodam', time: '07:35', platform: 'Platform 1' }
    ]
  },
  {
    trainId: 'KMRL-002',
    trainName: 'Metro Express 2',
    status: 'revenue',
    schedule: [
      { station: 'Thykoodam', time: '06:15', platform: 'Platform 2' },
      { station: 'Vytilla', time: '06:20', platform: 'Platform 2' },
      { station: 'Elamkulam', time: '06:25', platform: 'Platform 2' },
      { station: 'Kadavanthra', time: '06:30', platform: 'Platform 2' },
      { station: 'Ernakulam South', time: '06:35', platform: 'Platform 2' },
      { station: 'Maharaja\'s College', time: '06:40', platform: 'Platform 2' },
      { station: 'Town Hall', time: '06:45', platform: 'Platform 2' },
      { station: 'Kaloor', time: '06:50', platform: 'Platform 2' },
      { station: 'JLN Stadium', time: '06:55', platform: 'Platform 2' },
      { station: 'Palarivattom', time: '07:00', platform: 'Platform 2' },
      { station: 'Changampuzha Park', time: '07:05', platform: 'Platform 2' },
      { station: 'Edapally', time: '07:10', platform: 'Platform 2' },
      { station: 'Pathadipalam', time: '07:15', platform: 'Platform 2' },
      { station: 'Cochin University', time: '07:20', platform: 'Platform 2' },
      { station: 'Kalamassery', time: '07:25', platform: 'Platform 2' },
      { station: 'Muttom', time: '07:30', platform: 'Platform 2' },
      { station: 'Ambattukavu', time: '07:35', platform: 'Platform 2' },
      { station: 'Companypady', time: '07:40', platform: 'Platform 2' },
      { station: 'Pulinchodu', time: '07:45', platform: 'Platform 2' },
      { station: 'Aluva', time: '07:50', platform: 'Platform 2' }
    ]
  },
  {
    trainId: 'KMRL-003',
    trainName: 'Metro Express 3',
    status: 'revenue',
    schedule: [
      { station: 'Aluva', time: '07:00', platform: 'Platform 1' },
      { station: 'Pulinchodu', time: '07:05', platform: 'Platform 1' },
      { station: 'Companypady', time: '07:10', platform: 'Platform 1' },
      { station: 'Ambattukavu', time: '07:15', platform: 'Platform 1' },
      { station: 'Muttom', time: '07:20', platform: 'Platform 1' },
      { station: 'Kalamassery', time: '07:25', platform: 'Platform 1' },
      { station: 'Cochin University', time: '07:30', platform: 'Platform 1' },
      { station: 'Pathadipalam', time: '07:35', platform: 'Platform 1' },
      { station: 'Edapally', time: '07:40', platform: 'Platform 1' },
      { station: 'Changampuzha Park', time: '07:45', platform: 'Platform 1' },
      { station: 'Palarivattom', time: '07:50', platform: 'Platform 1' },
      { station: 'JLN Stadium', time: '07:55', platform: 'Platform 1' },
      { station: 'Kaloor', time: '08:00', platform: 'Platform 1' },
      { station: 'Town Hall', time: '08:05', platform: 'Platform 1' },
      { station: 'Maharaja\'s College', time: '08:10', platform: 'Platform 1' },
      { station: 'Ernakulam South', time: '08:15', platform: 'Platform 1' },
      { station: 'Kadavanthra', time: '08:20', platform: 'Platform 1' },
      { station: 'Elamkulam', time: '08:25', platform: 'Platform 1' },
      { station: 'Vytilla', time: '08:30', platform: 'Platform 1' },
      { station: 'Thykoodam', time: '08:35', platform: 'Platform 1' }
    ]
  }
];

// Station order for calculating distance and fare
const stationOrder = [
  'Aluva', 'Pulinchodu', 'Companypady', 'Ambattukavu', 'Muttom',
  'Kalamassery', 'Cochin University', 'Pathadipalam', 'Edapally',
  'Changampuzha Park', 'Palarivattom', 'JLN Stadium', 'Kaloor',
  'Town Hall', 'Maharaja\'s College', 'Ernakulam South', 'Kadavanthra',
  'Elamkulam', 'Vytilla', 'Thykoodam'
];

function findBestTrain(from: string, to: string, requestedTime?: string): any {
  const fromIndex = stationOrder.indexOf(from);
  const toIndex = stationOrder.indexOf(to);
  
  if (fromIndex === -1 || toIndex === -1) {
    return null;
  }

  const isOutbound = fromIndex < toIndex;
  
  // Find trains going in the right direction
  const suitableTrains = mockTrainSchedule.filter(train => {
    const fromSchedule = train.schedule.find(s => s.station === from);
    const toSchedule = train.schedule.find(s => s.station === to);
    
    if (!fromSchedule || !toSchedule) return false;
    
    // Check if train goes in the right direction
    const fromTime = fromSchedule.time;
    const toTime = toSchedule.time;
    
    if (isOutbound) {
      return fromTime < toTime; // Train goes from Aluva to Thykoodam
    } else {
      return fromTime > toTime; // Train goes from Thykoodam to Aluva
    }
  });

  if (suitableTrains.length === 0) {
    return null;
  }

  // If time is specified, find the closest train
  if (requestedTime) {
    const requestedMinutes = timeToMinutes(requestedTime);
    
    suitableTrains.sort((a, b) => {
      const aFromTime = a.schedule.find(s => s.station === from)?.time || '00:00';
      const bFromTime = b.schedule.find(s => s.station === from)?.time || '00:00';
      
      const aMinutes = timeToMinutes(aFromTime);
      const bMinutes = timeToMinutes(bFromTime);
      
      return Math.abs(aMinutes - requestedMinutes) - Math.abs(bMinutes - requestedMinutes);
    });
  }

  return suitableTrains[0];
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function calculateFare(from: string, to: string): number {
  const fromIndex = stationOrder.indexOf(from);
  const toIndex = stationOrder.indexOf(to);
  const distance = Math.abs(toIndex - fromIndex);
  
  // Fare calculation based on distance
  if (distance <= 5) return 10;
  if (distance <= 10) return 15;
  if (distance <= 15) return 20;
  return 25;
}

export async function POST(request: NextRequest) {
  try {
    const body: JourneyRequest = await request.json();
    const { from, to, date, time } = body;

    if (!from || !to) {
      return NextResponse.json(
        { error: 'From and to stations are required' },
        { status: 400 }
      );
    }

    if (from === to) {
      return NextResponse.json(
        { error: 'Departure and arrival stations cannot be the same' },
        { status: 400 }
      );
    }

    // Find the best train for the journey
    const bestTrain = findBestTrain(from, to, time);
    
    if (!bestTrain) {
      return NextResponse.json(
        { error: 'No suitable train found for this route' },
        { status: 404 }
      );
    }

    // Get schedule for the specific stations
    const fromSchedule = bestTrain.schedule.find((s: any) => s.station === from);
    const toSchedule = bestTrain.schedule.find((s: any) => s.station === to);
    
    if (!fromSchedule || !toSchedule) {
      return NextResponse.json(
        { error: 'Invalid station in route' },
        { status: 400 }
      );
    }

    // Calculate journey details
    const fromTime = fromSchedule.time;
    const toTime = toSchedule.time;
    const platform = fromSchedule.platform;
    const fare = calculateFare(from, to);
    
    // Calculate duration
    const fromMinutes = timeToMinutes(fromTime);
    const toMinutes = timeToMinutes(toTime);
    const duration = Math.abs(toMinutes - fromMinutes);

    const journey: Journey = {
      from,
      to,
      steps: [
        {
          type: 'metro',
          from,
          to,
          duration,
          fare,
          line: 'Line 1',
          platform,
          departureTime: fromTime,
          arrivalTime: toTime,
          trainId: bestTrain.trainId
        }
      ],
      totalTime: duration,
      totalFare: fare,
      departureTime: fromTime,
      arrivalTime: toTime
    };

    return NextResponse.json(journey);
  } catch (error) {
    console.error('Journey planning error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
