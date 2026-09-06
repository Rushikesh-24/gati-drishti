export interface StationNode {
  id: string;
  code: string;
  name: string;
  scheduledArrival: string;
  scheduledDeparture: string;
  actualArrival?: string;
  actualDeparture?: string;
  predictedArrival?: string;
  predictedDeparture?: string;
  status: "COMPLETED" | "CURRENT" | "UPCOMING";
  delayMinutes?: number;
}

export interface RouteData {
  trainNumber: string;
  stations: StationNode[];
}

export const mockRouteData: RouteData = {
  trainNumber: "12951",
  stations: [
    {
      id: "st-1",
      code: "MMCT",
      name: "Mumbai Central",
      scheduledArrival: "17:00",
      scheduledDeparture: "17:00",
      actualArrival: "17:00",
      actualDeparture: "17:00",
      status: "COMPLETED",
    },
    {
      id: "st-2",
      code: "ST",
      name: "Surat",
      scheduledArrival: "19:43",
      scheduledDeparture: "19:48",
      actualArrival: "19:43",
      actualDeparture: "19:48",
      status: "COMPLETED",
    },
    {
      id: "st-3",
      code: "BRC",
      name: "Vadodara",
      scheduledArrival: "21:06",
      scheduledDeparture: "21:16",
      actualArrival: "21:10",
      actualDeparture: "21:20",
      status: "CURRENT",
      delayMinutes: 4,
    },
    {
      id: "st-4",
      code: "KOTA",
      name: "Kota",
      scheduledArrival: "03:15",
      scheduledDeparture: "03:25",
      predictedArrival: "03:20",
      predictedDeparture: "03:30",
      status: "UPCOMING",
      delayMinutes: 5,
    },
    {
      id: "st-5",
      code: "NDLS",
      name: "New Delhi",
      scheduledArrival: "08:32",
      scheduledDeparture: "08:32",
      predictedArrival: "08:37",
      predictedDeparture: "08:37",
      status: "UPCOMING",
      delayMinutes: 5,
    },
  ],
};
