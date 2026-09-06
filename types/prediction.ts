export interface PredictionFactor {
  id: string;
  name: string;
  impactMinutes: number;
}

export interface PredictionResult {
  baseExpectedArrival: string;
  predictedEta: string;
  baseDelayMinutes: number;
  totalDelayImpactMinutes: number;
  confidence: "High" | "Medium" | "Low";
  confidencePercentage: number;
  riskLevel: "Low" | "Elevated" | "High";
  windowStart: string;
  windowEnd: string;
  factors: PredictionFactor[];
}
