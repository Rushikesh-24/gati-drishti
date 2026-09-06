import { NextResponse } from 'next/server';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const trainNumber = (await params).id;

  // Fake ETA prediction data logic matching the API Portal payload schema
  const etaData = {
    trainNumber,
    prediction: {
      expectedDelayMinutes: Math.floor(Math.random() * 20),
      confidenceScore: Math.floor(80 + Math.random() * 15),
      riskLevel: ["LOW", "MEDIUM", "HIGH"][Math.floor(Math.random() * 3)],
      factors: [
        { factor: "Network Congestion", impact: "High" },
        { factor: "Weather", impact: "Low" }
      ]
    }
  };

  return NextResponse.json({ success: true, data: etaData }, { headers: corsHeaders });
}
