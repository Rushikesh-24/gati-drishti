export type CongestionLevel = "Normal" | "Moderate" | "Heavy" | "Disruption";

export interface NetworkNode {
  id: string;
  name: string;
  x: number; // For schematic rendering (0-100)
  y: number; // For schematic rendering (0-100)
  type: "station" | "junction";
  status?: CongestionLevel;
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  status: CongestionLevel;
}

export interface NetworkTrain {
  id: string;
  number: string;
  name: string;
  edgeId: string;
  progress: number; // 0-100 along the edge
  baseEta: string;
  dynamicEta: string;
  delayMinutes: number;
  status: "on-time" | "delayed" | "stopped";
}

// Simplified schematic of Mumbai -> Delhi corridor
export const initialNodes: NetworkNode[] = [
  { id: "MMCT", name: "Mumbai Central", x: 10, y: 80, type: "station" },
  { id: "BVI", name: "Borivali", x: 15, y: 70, type: "station" },
  { id: "ST", name: "Surat", x: 25, y: 55, type: "junction" },
  { id: "BRC", name: "Vadodara", x: 40, y: 45, type: "junction" },
  { id: "RTM", name: "Ratlam", x: 55, y: 35, type: "junction" },
  { id: "KOTA", name: "Kota Jn", x: 70, y: 25, type: "junction" },
  { id: "SWM", name: "Sawai Madhopur", x: 80, y: 20, type: "station" },
  { id: "NDLS", name: "New Delhi", x: 90, y: 10, type: "station" }
];

export const initialEdges: NetworkEdge[] = [
  { id: "e1", source: "MMCT", target: "BVI", status: "Normal" },
  { id: "e2", source: "BVI", target: "ST", status: "Normal" },
  { id: "e3", source: "ST", target: "BRC", status: "Normal" },
  { id: "e4", source: "BRC", target: "RTM", status: "Normal" },
  { id: "e5", source: "RTM", target: "KOTA", status: "Normal" },
  { id: "e6", source: "KOTA", target: "SWM", status: "Normal" },
  { id: "e7", source: "SWM", target: "NDLS", status: "Normal" }
];

export const initialTrains: NetworkTrain[] = [
  { id: "t1", number: "12951", name: "Rajdhani Exp", edgeId: "e3", progress: 60, baseEta: "18:40", dynamicEta: "18:40", delayMinutes: 0, status: "on-time" },
  { id: "t2", number: "12903", name: "Golden Temple Mail", edgeId: "e4", progress: 20, baseEta: "19:15", dynamicEta: "19:15", delayMinutes: 0, status: "on-time" },
  { id: "t3", number: "12431", name: "Rajdhani Exp (TVC)", edgeId: "e5", progress: 85, baseEta: "20:05", dynamicEta: "20:05", delayMinutes: 0, status: "on-time" },
  { id: "t4", number: "12283", name: "Duronto Exp", edgeId: "e2", progress: 40, baseEta: "21:30", dynamicEta: "21:30", delayMinutes: 0, status: "on-time" }
];
