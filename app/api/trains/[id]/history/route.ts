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

  const onTimePercentage = Math.floor(65 + Math.random() * 30);
  const avgDelayOverall = Math.floor(Math.random() * 45);
  
  const stations = ["MTJ", "RTM", "KOTA", "BINA", "NDLS", "BCT"];
  const randomStation = stations[Math.floor(Math.random() * stations.length)];
  
  const historyData = {
    trainNumber,
    onTimePercentage,
    avgDelayOverall,
    bottlenecks: [
      { 
        station: randomStation, 
        avgDelay: Math.floor(avgDelayOverall * 1.5), 
        recoveryRate: parseFloat(Math.random().toFixed(2)) 
      }
    ]
  };

  return NextResponse.json({ success: true, data: historyData }, { headers: corsHeaders });
}
