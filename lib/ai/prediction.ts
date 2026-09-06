import type { LiveStatus } from "@/types/live-status";
import type { PredictionResult, PredictionFactor } from "@/types/prediction";

// Helper to add minutes to a HH:MM time string
function addMinutesToTime(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return timeStr;

  const date = new Date();
  date.setHours(h, m, 0, 0);
  date.setMinutes(date.getMinutes() + minutes);

  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

// Generate a deterministic but realistic AI simulation based on the live status
export function calculatePrediction(status: LiveStatus): PredictionResult {
  const baseDelay = status.delayMinutes;
  
  // Create deterministic pseudo-random factors based on train number
  const seed = parseInt(status.trainNumber, 10) || 12951;
  
  const factors: PredictionFactor[] = [
    {
      id: "f1",
      name: "Historical pattern",
      impactMinutes: (seed % 5) + 2, // e.g., +4
    },
    {
      id: "f2",
      name: "Current delay propagation",
      impactMinutes: Math.max(2, Math.floor(baseDelay * 0.4)), // e.g., +5
    },
    {
      id: "f3",
      name: "Network congestion",
      impactMinutes: (seed % 4) + 1, // e.g., +3
    },
    {
      id: "f4",
      name: "Station dwell time",
      impactMinutes: (seed % 3) + 1, // e.g., +2
    },
    {
      id: "f5",
      name: "Expected recovery trend",
      impactMinutes: -((seed % 4) + 2), // e.g., -3
    }
  ];

  const totalDelayImpactMinutes = factors.reduce((sum, f) => sum + f.impactMinutes, 0);
  
  const predictedEta = addMinutesToTime(status.expectedArrival, totalDelayImpactMinutes);
  const windowStart = addMinutesToTime(predictedEta, -3);
  const windowEnd = addMinutesToTime(predictedEta, 4);

  const riskLevel = totalDelayImpactMinutes > 20 ? "High" : totalDelayImpactMinutes > 10 ? "Elevated" : "Low";
  
  // Calculate confidence based on progress (further along = higher confidence)
  const confidencePercentage = Math.min(98, Math.max(65, status.progressPercentage + (seed % 10)));
  const confidence = confidencePercentage >= 85 ? "High" : confidencePercentage >= 75 ? "Medium" : "Low";

  return {
    baseExpectedArrival: status.expectedArrival,
    predictedEta,
    baseDelayMinutes: baseDelay,
    totalDelayImpactMinutes,
    confidence,
    confidencePercentage,
    riskLevel,
    windowStart,
    windowEnd,
    factors,
  };
}
