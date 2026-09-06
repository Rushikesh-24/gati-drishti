import { NextResponse } from 'next/server';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
  const alertTypes = ["HIGH", "MEDIUM", "LOW"];
  const stations = ["ST", "BRC", "RTM", "KOTA", "NDLS", "PNBE"];
  const reasons = [
    "Major congestion detected", 
    "Signal failure", 
    "Track maintenance scheduled", 
    "Heavy rainfall causing slow movement", 
    "Power grid fluctuation"
  ];

  const randomAlerts = Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() => ({
    id: `alert-${Math.floor(Math.random() * 1000)}`,
    type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
    node: stations[Math.floor(Math.random() * stations.length)],
    message: `${reasons[Math.floor(Math.random() * reasons.length)]} at ${stations[Math.floor(Math.random() * stations.length)]} Junction.`,
    timestamp: new Date().toISOString()
  }));

  return NextResponse.json({ success: true, data: randomAlerts }, { headers: corsHeaders });
}
