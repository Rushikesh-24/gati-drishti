import type { LiveStatus } from "@/types/live-status";
import { mockRouteData } from "@/lib/mock/route";

export async function fetchLiveStatus(trainNumber: string): Promise<LiveStatus | null> {
  try {
    // Attempt real live fetch
    const slug = trainNumber === '12951' 
      ? '12951-mumbai-central-new-delhi-rajdhani-express-mmct-to-ndls'
      : trainNumber;
    const url = `https://www.railyatri.in/live-train-status/${slug}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      next: { revalidate: 60 } // cache for 60s
    });

    if (!response.ok) return null;

    const html = await response.text();
    const startStr = '<script id="__NEXT_DATA__" type="application/json">';
    const startIdx = html.indexOf(startStr);
    if (startIdx === -1) return null;

    const endIdx = html.indexOf('</script>', startIdx);
    if (endIdx === -1) return null;

    const jsonText = html.substring(startIdx + startStr.length, endIdx);
    const data = JSON.parse(jsonText);

    const pageProps = data?.props?.pageProps;
    if (!pageProps || (!pageProps.ltsData && !pageProps.initialState?.trainRoute)) return null;

    const ltsData = pageProps.ltsData || {};
    let trainRoute = [];
    if (pageProps.timeTableData && Array.isArray(pageProps.timeTableData) && pageProps.timeTableData[0]?.route) {
      trainRoute = pageProps.timeTableData[0].route;
    } else if (pageProps.initialState?.trainRoute) {
      trainRoute = pageProps.initialState.trainRoute;
    }

    // Filter out stations that don't have stops
    const stations = trainRoute.filter((st: any) => st.stop);

    // Map to our StationNode format
    let currentIdx = -1;
    let nextStationFound = false;

    // First try the new active train schema
    const nextStoppageName = ltsData.next_stoppage_info?.next_stoppage;
    let delayMinutes = 0;
    let lastUpdatedMsg = "Just now";

    if (nextStoppageName) {
      delayMinutes = ltsData.next_stoppage_info?.next_stoppage_delay || 0;
      if (ltsData.current_location_info && ltsData.current_location_info.length > 0) {
        lastUpdatedMsg = ltsData.current_location_info[0].message || lastUpdatedMsg;
      }
    } else {
      // Try to extract delay from new_message (inactive train)
      const delayMatch = ltsData.new_message?.match(/delayed by (\d+)/i);
      if (delayMatch) {
        delayMinutes = parseInt(delayMatch[1], 10);
      }
      lastUpdatedMsg = ltsData.new_message || ltsData.title || "Just now";
    }

    const route = stations.map((st: any, idx: number) => {
      // Clean up tildes and match station names
      const stName = st.station_name.replace(/~/g, '').trim();
      const nStoppageName = nextStoppageName ? nextStoppageName.replace(/~/g, '').trim() : '';

      // Check next stoppage for active trains
      if (nStoppageName && stName === nStoppageName) {
        currentIdx = idx > 0 ? idx - 1 : 0;
        nextStationFound = true;
      }
      // Check old schema for inactive trains
      else if (st.station_name === ltsData.next_station_name) {
        currentIdx = idx > 0 ? idx - 1 : 0;
        nextStationFound = true;
      }

      // Convert minutes from midnight to HH:MM
      const formatTime = (mins: number) => {
        if (mins == null) return "00:00";
        const h = Math.floor(mins / 60) % 24;
        const m = mins % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      };

      return {
        id: `st-${st.station_code}`,
        code: st.station_code,
        name: st.station_name,
        scheduledArrival: formatTime(st.sta_min),
        scheduledDeparture: formatTime(st.std_min),
        status: "UPCOMING" as const,
      };
    });

    // If train hasn't started yet or runs on specific days
    if (lastUpdatedMsg.toLowerCase().includes("hasn't started") || lastUpdatedMsg.toLowerCase().includes("runs only on")) {
      currentIdx = 0;
    }

    if (currentIdx === -1) currentIdx = 0; // fallback

    // Set statuses
    route.forEach((st: any, idx: number) => {
      if (idx < currentIdx) st.status = "COMPLETED";
      else if (idx === currentIdx) st.status = "CURRENT";
      else st.status = "UPCOMING";
    });

    // Assign delay to current station
    if (route[currentIdx]) {
      route[currentIdx].delayMinutes = delayMinutes;
    }

    return {
      trainNumber,
      currentStation: route[currentIdx]?.name || ltsData.source_stn_name || "Source",
      previousStation: currentIdx > 0 ? route[currentIdx - 1]?.name : "None",
      nextStation: route[currentIdx + 1]?.name || ltsData.dest_stn_name || "Destination",
      delayMinutes: delayMinutes,
      progressPercentage: Math.round((currentIdx / (route.length - 1 || 1)) * 100),
      expectedArrival: route[route.length - 1]?.scheduledArrival || "00:00",
      lastUpdated: lastUpdatedMsg,
      route: route,
      isDemo: false,
    };
  } catch (err) {
    console.error("RailYatri Scraper Error:", err);
    return null;
  }
}

export function generateSimulatedStatus(trainNumber: string): LiveStatus {
  // Clone mockRouteData to simulate a realistic progression
  const route = JSON.parse(JSON.stringify(mockRouteData.stations));
  
  // For demo, we assume the train is at station 2 (Vadodara)
  const currentStationIndex = 2;
  
  // Update statuses to make the simulation dynamic
  route.forEach((st: any, idx: number) => {
    if (idx < currentStationIndex) st.status = "COMPLETED";
    else if (idx === currentStationIndex) st.status = "CURRENT";
    else st.status = "UPCOMING";
  });

  return {
    trainNumber,
    currentStation: route[currentStationIndex].name,
    previousStation: route[currentStationIndex - 1].name,
    nextStation: route[currentStationIndex + 1].name,
    delayMinutes: route[currentStationIndex].delayMinutes || 12,
    progressPercentage: Math.round((currentStationIndex / (route.length - 1)) * 100),
    expectedArrival: route[currentStationIndex].predictedArrival || route[currentStationIndex].scheduledArrival,
    lastUpdated: "Just now",
    route: route,
    isDemo: true,
  };
}
