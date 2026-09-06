import { NextResponse } from "next/server";
import { fetchLiveStatus, generateSimulatedStatus } from "@/lib/api/railyatri";

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
  const { id } = await params;
  
  if (!id) {
    return NextResponse.json(
      { success: false, error: "Train ID required" },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    // Attempt real live fetch first
    let liveStatus = await fetchLiveStatus(id);

    // Fallback to simulated demo
    if (!liveStatus) {
      liveStatus = generateSimulatedStatus(id);
    }

    // Add a randomized "lastUpdated" for demo polling changes
    if (liveStatus.isDemo) {
      const secondsAgo = Math.floor(Math.random() * 15);
      liveStatus.lastUpdated = `${secondsAgo} seconds ago`;
    }

    return NextResponse.json({ success: true, data: liveStatus }, { headers: corsHeaders });
  } catch (error) {
    console.error("Live Status API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch live status" },
      { status: 500, headers: corsHeaders }
    );
  }
}
