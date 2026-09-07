export interface StationDelayNode {
  station: string;
  avgDelay: number;
  recovery: number;
}

export interface DayTimePattern {
  day: string;
  morning: number; // Avg delay in mins
  afternoon: number;
  evening: number;
  night: number;
}

export interface JourneyHistory {
  date: string;
  delay: number;
}

export interface HistoricalIntelligence {
  trainNumber: string;
  avgDelayOverall: number;
  onTimePercentage: number;
  insights: string[];
  stationDelays: StationDelayNode[];
  dayTimePatterns: DayTimePattern[];
  journeyHistory: JourneyHistory[];
}

export function generateHistoricalIntelligence(trainNumber: string): HistoricalIntelligence {
  const seed = parseInt(trainNumber, 10) || 12951;
  
  // Seed-based pseudo-random data generation
  const onTimePercentage = Math.min(95, Math.max(50, 75 + (seed % 20)));
  const avgDelayOverall = Math.max(5, (seed % 35));

  const insights = [
    `Train ${trainNumber} historically experiences higher delay variance around major junction points.`,
    `Historical patterns indicate partial recovery (avg 5-10 min) after the midpoint segment.`,
    `Current delay profile is ${avgDelayOverall > 15 ? 'above' : 'below'} the historical median for this route.`
  ];

  const stationDelays: StationDelayNode[] = [
    { station: "NDLS", avgDelay: 2, recovery: 0 },
    { station: "MTJ", avgDelay: 12, recovery: 0 },
    { station: "KOTA", avgDelay: 25, recovery: 0 },
    { station: "RTM", avgDelay: 18, recovery: 10 }, // Recovering
    { station: "BRC", avgDelay: 22, recovery: 0 },
    { station: "MMCT", avgDelay: 15, recovery: 8 },
  ];

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayTimePatterns: DayTimePattern[] = days.map((day, idx) => ({
    day,
    morning: 5 + ((seed + idx) % 15),
    afternoon: 10 + ((seed + idx * 2) % 25),
    evening: 15 + ((seed + idx * 3) % 35),
    night: 8 + ((seed + idx * 4) % 20),
  }));

  const journeyHistory: JourneyHistory[] = Array.from({ length: 30 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (30 - idx));
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      delay: Math.max(0, Math.round(avgDelayOverall + (Math.sin(idx) * 15) + ((seed % 10) - 5)))
    };
  });

  return {
    trainNumber,
    avgDelayOverall,
    onTimePercentage,
    insights,
    stationDelays,
    dayTimePatterns,
    journeyHistory,
  };
}
