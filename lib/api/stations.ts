import fs from 'fs';
import path from 'path';

export interface StationData {
  name: string;
  code: string;
  state: string;
  zone: string;
  latitude: number;
  longitude: number;
  isJunction: boolean;
  routeCount: number;
}

let stationsCache: StationData[] | null = null;

export function getStations(): StationData[] {
  if (stationsCache) {
    return stationsCache;
  }

  try {
    const csvPath = path.join(process.cwd(), 'public', 'india_railway_stations.csv');
    const fileContents = fs.readFileSync(csvPath, 'utf-8');
    
    const lines = fileContents.split(/\r?\n/).filter(line => line.trim() !== '');
    
    // Skip header line (index 0)
    // Header: station_name,station_code,state,railway_zone_code,latitude,longitude,is_junction,route_count,station_count_in_state
    const stations: StationData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Basic split since data doesn't contain quotes
      const parts = line.split(',');
      if (parts.length >= 8) {
        stations.push({
          name: parts[0].trim(),
          code: parts[1].trim(),
          state: parts[2].trim(),
          zone: parts[3].trim(),
          latitude: parseFloat(parts[4]),
          longitude: parseFloat(parts[5]),
          isJunction: parts[6].trim().toLowerCase() === 'true',
          routeCount: parseInt(parts[7], 10) || 0
        });
      }
    }
    
    stationsCache = stations;
    return stationsCache;
  } catch (error) {
    console.error('Error parsing stations CSV:', error);
    return [];
  }
}

export function searchStations(query: string, limit: number = 20): StationData[] {
  if (!query || query.trim() === '') return [];
  const stations = getStations();
  
  const lowerQuery = query.toLowerCase();
  
  const results = stations.filter(st => {
    const matchStr = `${st.name} ${st.code} ${st.state} ${st.zone}`.toLowerCase();
    return matchStr.includes(lowerQuery);
  });
  
  return results.slice(0, limit);
}

export function getStationByCode(code: string): StationData | null {
  const stations = getStations();
  const lowerCode = code.toLowerCase();
  
  return stations.find(st => st.code.toLowerCase() === lowerCode) || null;
}
