import { NextResponse } from "next/server";
import type { Train, RailYatriSearchResponse } from "@/types/train";
import { mockTrains } from "@/lib/mock/trains";

const RAILYATRI_SEARCH_URL = "https://search.railyatri.in/v2/mobile/trainsearch.json";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length < 3) {
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    const url = new URL(RAILYATRI_SEARCH_URL);
    url.searchParams.set("q", query);
    url.searchParams.set("user_id", "-1788599172");
    url.searchParams.set("temp_user_id", "-1788599172");

    const response = await fetch(url.toString(), {
      // Adding headers to mimic a regular request just in case
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`External API responded with status: ${response.status}`);
    }

    const json = (await response.json()) as RailYatriSearchResponse;

    if (!json.success || !json.trains) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Normalize to internal model
    const normalizedTrains: Train[] = json.trains.map((t) => ({
      id: `ry-${t.train_number}`,
      number: t.train_number,
      name: t.train_name || t.eng_train_name,
      origin: t.src_stn_name,
      originCode: t.src_stn_code,
      destination: t.dstn_stn_name,
      destinationCode: t.dstn_stn_code,
      isDemo: false,
    }));

    return NextResponse.json({ success: true, data: normalizedTrains });
    
  } catch (error) {
    console.error("Train search API Error:", error);
    
    // Fallback logic for demo trains
    const fallbackData = mockTrains.filter(t => 
      t.number.includes(query) || 
      t.name.toLowerCase().includes(query.toLowerCase())
    ).map(t => ({
      ...t,
      originCode: t.origin.substring(0, 4).toUpperCase(), // mock code
      destinationCode: t.destination.substring(0, 4).toUpperCase(), // mock code
      isDemo: true
    }));

    // If we have fallback data matching the query, return it
    if (fallbackData.length > 0) {
      return NextResponse.json({ success: true, data: fallbackData });
    }

    // Otherwise return error
    return NextResponse.json(
      { success: false, error: "Failed to fetch train data" },
      { status: 500 }
    );
  }
}
