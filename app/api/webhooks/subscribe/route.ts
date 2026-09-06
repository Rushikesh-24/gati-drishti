import { NextResponse } from 'next/server';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || !body.targetUrl) {
      return NextResponse.json(
        { success: false, error: "Invalid payload. 'targetUrl' is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    const webhookId = `wh_${Math.random().toString(36).substring(2, 9)}`;

    return NextResponse.json(
      { success: true, webhookId, status: "Active" },
      { status: 201, headers: corsHeaders }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body payload." },
      { status: 400, headers: corsHeaders }
    );
  }
}
