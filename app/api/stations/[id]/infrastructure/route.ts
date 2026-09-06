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
  const stationCode = (await params).id;

  const platforms = Math.floor(4 + Math.random() * 16);
  const occupied = Math.floor(Math.random() * platforms);
  const approachingTrains = Math.floor(Math.random() * 8);
  const congestionIndex = Math.floor(30 + Math.random() * 70);

  const infrastructureData = {
    stationCode,
    platforms,
    occupied,
    approachingTrains,
    congestionIndex
  };

  return NextResponse.json({ success: true, data: infrastructureData }, { headers: corsHeaders });
}
