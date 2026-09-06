export interface Train {
  id: string;
  number: string;
  name: string;
  origin: string;
  destination: string;
  status: "ON_TIME" | "DELAYED" | "CANCELLED";
  delayMinutes?: number;
}

export const mockTrains: Train[] = [
  {
    id: "t-1",
    number: "12951",
    name: "Rajdhani Express",
    origin: "Mumbai Central",
    destination: "New Delhi",
    status: "ON_TIME",
  },
  {
    id: "t-2",
    number: "12925",
    name: "Paschim Express",
    origin: "Bandra Terminus",
    destination: "Amritsar",
    status: "DELAYED",
    delayMinutes: 45,
  },
  {
    id: "t-3",
    number: "12283",
    name: "Duronto Express",
    origin: "Ernakulam",
    destination: "Nizamuddin",
    status: "ON_TIME",
  },
];
