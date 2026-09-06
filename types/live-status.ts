import type { StationNode } from "@/lib/mock/route";

export interface LiveStatus {
  trainNumber: string;
  currentStation: string;
  previousStation: string;
  nextStation: string;
  delayMinutes: number;
  progressPercentage: number;
  expectedArrival: string;
  lastUpdated: string;
  route: StationNode[];
  isDemo: boolean;
}
