import { useState, useEffect } from "react";
import type { LiveStatus } from "@/types/live-status";

export function useLiveStatus(trainNumber: string | null, intervalMs: number = 30000) {
  const [data, setData] = useState<LiveStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trainNumber) {
      setData(null);
      return;
    }

    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const fetchData = async () => {
      if (!data) setIsLoading(true); // Only show loading on initial fetch
      
      try {
        const res = await fetch(`/api/trains/${encodeURIComponent(trainNumber)}/live`);
        const json = await res.json();

        if (!isMounted) return;

        if (json.success) {
          setData(json.data);
          setError(null);
        } else {
          throw new Error(json.error || "Failed to fetch live status");
        }
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        if (isMounted) setIsLoading(false);
      }

      // Schedule next fetch
      if (isMounted) {
        timeoutId = setTimeout(fetchData, intervalMs);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [trainNumber, intervalMs]);

  return { data, isLoading, error };
}
