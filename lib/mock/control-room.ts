export interface ControlTrain {
  id: string;
  number: string;
  name: string;
  route: string;
  status: "ON-TIME" | "DELAYED" | "CRITICAL";
  delay: number; // minutes
  eta: string;
  confidence: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
  edgeId: string;
  progress: number;
}

export interface ControlAlert {
  id: number;
  type: "INFO" | "MEDIUM" | "HIGH";
  message: string;
  time: string;
}

export const initialControlTrains: ControlTrain[] = [
  { id: "t1", number: "12951", name: "Rajdhani Exp", route: "MMCT → NDLS", status: "ON-TIME", delay: 0, eta: "18:40", confidence: 92, risk: "LOW", edgeId: "e3", progress: 60 },
  { id: "t2", number: "12903", name: "Golden Temple Mail", route: "MMCT → ASR", status: "ON-TIME", delay: 5, eta: "19:15", confidence: 88, risk: "LOW", edgeId: "e4", progress: 20 },
  { id: "t3", number: "12431", name: "Rajdhani Exp", route: "TVC → NZM", status: "ON-TIME", delay: 0, eta: "20:05", confidence: 94, risk: "LOW", edgeId: "e5", progress: 85 },
  { id: "t4", number: "12283", name: "Duronto Exp", route: "ERS → NZM", status: "DELAYED", delay: 12, eta: "21:30", confidence: 85, risk: "MEDIUM", edgeId: "e2", progress: 40 },
  { id: "t5", number: "12953", name: "Aug Kranti Rajdhani", route: "MMCT → NZM", status: "ON-TIME", delay: 0, eta: "22:15", confidence: 90, risk: "LOW", edgeId: "e1", progress: 80 },
  { id: "t6", number: "19019", name: "Dehradun Exp", route: "BDTS → DDN", status: "DELAYED", delay: 35, eta: "01:20", confidence: 75, risk: "HIGH", edgeId: "e6", progress: 10 },
  { id: "t7", number: "12471", name: "Swaraj Express", route: "BDTS → SVDK", status: "ON-TIME", delay: 2, eta: "03:45", confidence: 91, risk: "LOW", edgeId: "e7", progress: 50 },
];

export const initialControlAlerts: ControlAlert[] = [
  { id: 1, type: "INFO", message: "Network operating within nominal parameters.", time: "18:00" },
  { id: 2, type: "INFO", message: "Train 12283 recovery trend detected.", time: "18:02" },
  { id: 3, type: "MEDIUM", message: "Train 19019 ETA changed by +12 min due to speed restriction.", time: "18:05" },
];

export const initialInsights = [
  "No significant secondary delays detected in current window.",
  "12951 shows high recovery probability before NDLS.",
  "Congestion around BRC junction is resolving."
];
