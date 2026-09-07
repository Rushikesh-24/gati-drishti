"use client"

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Train, Activity, Clock, AlertTriangle,
  MapPin, Route, Navigation2, CheckCircle2, ChevronRight,
  Database, Table2, LineChart as LineChartIcon
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine
} from 'recharts';
import { useDebounce } from "@/hooks/use-debounce";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Train as TrainType } from "@/types/train";

export function IntelligenceClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [trainData, setTrainData] = useState<any>(null);
  const [routeData, setRouteData] = useState<any[]>([]);

  const [bottlenecks, setBottlenecks] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'intelligence' | 'data'>('intelligence');

  // Search Dropdown States
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<TrainType[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Fetch global bottlenecks on mount
    fetch('/api/intelligence/bottlenecks')
      .then(res => res.json())
      .then(res => {
        if (res.success) setBottlenecks(res.data);
      })
      .catch(err => console.error("Failed to load bottlenecks", err));
  }, []);

  useEffect(() => {
    async function searchTrains() {
      if (debouncedQuery.trim().length < 3) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`/api/trains/search?q=${encodeURIComponent(debouncedQuery)}`);
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.data);
          setIsDropdownOpen(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }
    searchTrains();
  }, [debouncedQuery]);

  const handleSelectTrain = (trainNo: string) => {
    setSearchQuery(trainNo);
    setIsDropdownOpen(false);
    handleSearch(undefined, trainNo);
  };

  const handleSearch = async (e?: React.FormEvent, trainToSearch?: string) => {
    if (e) e.preventDefault();
    const query = trainToSearch || searchQuery.trim();
    if (!query) return;

    setLoading(true);
    setError(null);
    setTrainData(null);
    setRouteData([]);
    setIsDropdownOpen(false);

    try {
      const res = await fetch(`/api/intelligence/train/${query}`);
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Failed to fetch train data");
      }

      setTrainData(json.data.train);
      setRouteData(json.data.route);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Derived Insights
  // -------------------------------------------------------------
  const { maxDelayStation, avgDelayOverall, dataPoints, insights } = useMemo(() => {
    if (!routeData.length) return { maxDelayStation: null, avgDelayOverall: 0, dataPoints: 0, insights: [] };

    let maxDelay = -Infinity;
    let maxStation: any = null;
    let totalDelay = 0;
    let points = 0;

    // Filter stations that have delay data
    const delayData = routeData.filter(st => st.avg_delay !== null);

    delayData.forEach(st => {
      totalDelay += st.avg_delay;
      points++;
      if (st.avg_delay > maxDelay) {
        maxDelay = st.avg_delay;
        maxStation = st;
      }
    });

    const avg = points > 0 ? Math.round(totalDelay / points) : 0;

    const genInsights = [];
    if (maxStation) {
      genInsights.push(`Historical data shows ${maxStation.name} as the most severe bottleneck on this route, averaging +${maxDelay} min.`);
    }

    if (points > 0) {
      const startAvg = delayData.slice(0, Math.max(1, Math.floor(delayData.length / 3))).reduce((sum, d) => sum + d.avg_delay, 0) / Math.max(1, Math.floor(delayData.length / 3));
      const endAvg = delayData.slice(Math.max(0, delayData.length - Math.floor(delayData.length / 3))).reduce((sum, d) => sum + d.avg_delay, 0) / Math.max(1, Math.floor(delayData.length / 3));

      if (endAvg > startAvg + 15) {
        genInsights.push(`Delay progressively worsens throughout the journey. Late-stage recovery is historically rare for this train.`);
      } else if (startAvg > endAvg + 15) {
        genInsights.push(`High early delays usually show strong recovery by the time the train reaches its destination.`);
      } else {
        genInsights.push(`Delay variance remains relatively stable across the route.`);
      }
    }

    return {
      maxDelayStation: maxStation,
      avgDelayOverall: avg,
      dataPoints: points,
      insights: genInsights
    };
  }, [routeData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-xl text-sm">
          <p className="font-bold text-white mb-2">{data.name} ({data.code})</p>
          <div className="flex flex-col gap-1 text-zinc-300">
            <p className="flex justify-between gap-4">
              <span className="text-zinc-500">Scheduled:</span>
              <span>Day {data.arrival_day} - {data.arrival_time || 'Start'}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-zinc-500">Distance:</span>
              <span>{data.distance} km</span>
            </p>
            <p className="flex justify-between gap-4 pt-1 border-t border-zinc-800 mt-1">
              <span className="text-primary font-medium">Historical Delay:</span>
              <span className="text-primary font-bold">+{data.avg_delay} min</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-8 pb-20">

      {/* Search Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-xl">
          <form onSubmit={(e) => handleSearch(e)} className="flex flex-col sm:flex-row gap-3 p-2 bg-card rounded-lg border border-border shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                className="block w-full h-12 pl-10 pr-3 bg-transparent border-none focus:outline-none text-sm text-foreground"
                placeholder="Search train number or name (e.g. 12951)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length > 2) setIsDropdownOpen(true);
                }}
                onFocus={() => {
                  if (searchResults.length > 0) setIsDropdownOpen(true);
                }}
              />
            </div>
            <Button
              type="submit"
              variant="default"
              size="lg"
              className="h-12 w-full sm:w-auto px-8 shrink-0 font-bold"
              disabled={loading}
            >
              {loading ? 'Analysing...' : 'Analyse'}
            </Button>
          </form>

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && searchQuery.length >= 3 && searchResults.length > 0 && (
            <div className="absolute top-[70px] left-0 right-0 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50 max-h-64 overflow-y-auto">
              <ul>
                {searchResults.map((train) => (
                  <li key={train.id}>
                    <button
                      type="button"
                      className="w-full text-left px-4 py-3 hover:bg-muted flex flex-col gap-1 border-b border-border last:border-0 transition-colors"
                      onClick={() => handleSelectTrain(train.number)}
                    >
                      <span className="font-semibold text-foreground text-sm">
                        {train.number} - {train.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {train.origin} ({train.originCode}) → {train.destination} ({train.destinationCode})
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {trainData && (
          <div className="flex items-center gap-2 bg-card border border-border p-1 rounded-lg">
            <button
              onClick={() => setViewMode('intelligence')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === 'intelligence' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <LineChartIcon className="w-4 h-4" />
              Intelligence View
            </button>
            <button
              onClick={() => setViewMode('data')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 \${viewMode === 'data' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <Table2 className="w-4 h-4" />
              Data View
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Main Feature Content */}
      {trainData && routeData.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col gap-6">

          {/* Train Details Card */}
          <div className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-muted px-2 py-1 rounded text-xs font-semibold text-muted-foreground tracking-wider">{trainData.type_code}</span>
                <span className="text-muted-foreground text-sm flex items-center gap-1"><MapPin className="w-4 h-4" /> {routeData[0]?.name} → {routeData[routeData.length - 1]?.name}</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
                {trainData.train_name} <span className="text-muted-foreground">({trainData.train_no})</span>
              </h3>
            </div>

            <div className="flex gap-4">
              <div className="bg-background border border-border rounded-lg p-4 min-w-[120px]">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Avg Route Delay</p>
                <p className="text-2xl font-black text-primary">+{avgDelayOverall} <span className="text-sm font-medium text-muted-foreground">min</span></p>
              </div>
              <div className="bg-background border border-border rounded-lg p-4 min-w-[120px]">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Nodes Analysed</p>
                <p className="text-2xl font-black text-foreground">{dataPoints} <span className="text-sm font-medium text-muted-foreground">/ {routeData.length}</span></p>
              </div>
              <div className="bg-background border border-border rounded-lg p-4 min-w-[120px]">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Distance</p>
                <p className="text-2xl font-black text-foreground">{routeData[routeData.length - 1]?.distance} <span className="text-sm font-medium text-muted-foreground">km</span></p>
              </div>
            </div>
          </div>

          {viewMode === 'intelligence' ? (
            <>
              {/* Intelligence Chart */}
              <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-bold text-foreground">Average Delay Along Route</h4>
                    <p className="text-sm text-muted-foreground">Historical delay mapping across the {routeData[routeData.length - 1]?.distance}km journey</p>
                  </div>
                </div>

                <div className="h-100 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={routeData.filter(d => d.avg_delay !== null)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorDelay" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis
                        dataKey="code"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `+${value}m`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={0} stroke="hsl(var(--border))" />
                      <Area
                        type="monotone"
                        dataKey="avg_delay"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorDelay)"
                        activeDot={{ r: 6, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-primary" />
                    </div>
                    <h4 className="font-bold text-foreground">Historical Insights</h4>
                  </div>
                  <div className="flex flex-col gap-4">
                    {insights.map((insight, idx) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-sm text-foreground leading-relaxed">{insight}</p>
                      </div>
                    ))}
                    {insights.length === 0 && (
                      <p className="text-sm text-muted-foreground">Not enough historical delay data available for this route to generate insights.</p>
                    )}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <Route className="w-4 h-4 text-foreground" />
                      </div>
                      <h4 className="font-bold text-foreground">Route Reconstruction</h4>
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-[200px] pr-2 flex flex-col gap-0 relative">
                    {routeData.slice(0, 8).map((station, idx) => (
                      <div key={idx} className="flex gap-4 relative pb-4">
                        {idx !== Math.min(routeData.length, 8) - 1 && (
                          <div className="absolute left-[9px] top-4 bottom-0 w-0.5 bg-border z-0" />
                        )}
                        <div className="w-[20px] shrink-0 flex justify-center relative z-10 pt-1">
                          <div className={`w-2 h-2 rounded-full \${station.avg_delay ? 'bg-primary ring-4 ring-primary/20' : 'bg-muted-foreground'}`} />
                        </div>
                        <div className="flex-1 flex justify-between items-start">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{station.name}</p>
                            <p className="text-xs text-muted-foreground">{station.code} • {station.distance}km</p>
                          </div>
                          {station.avg_delay !== null && (
                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">+{station.avg_delay}m avg</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {routeData.length > 8 && (
                      <div className="text-xs text-muted-foreground pl-[36px] italic">
                        + {routeData.length - 8} more stations...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Data View (Raw Records) */
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Stop</th>
                      <th className="px-6 py-4 font-semibold">Station</th>
                      <th className="px-6 py-4 font-semibold">Schedule</th>
                      <th className="px-6 py-4 font-semibold">Distance</th>
                      <th className="px-6 py-4 font-semibold text-right">Historical Avg Delay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {routeData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-3 text-muted-foreground">{row.station_no}</td>
                        <td className="px-6 py-3">
                          <p className="font-semibold text-foreground">{row.name}</p>
                          <p className="text-xs text-muted-foreground">{row.code} • {row.zone}</p>
                        </td>
                        <td className="px-6 py-3 text-muted-foreground">
                          Day {row.arrival_day} - {row.arrival_time || 'Start'}
                        </td>
                        <td className="px-6 py-3 text-muted-foreground">{row.distance} km</td>
                        <td className="px-6 py-3 text-right">
                          {row.avg_delay !== null ? (
                            <span className="font-mono text-primary font-bold">+{row.avg_delay} min</span>
                          ) : (
                            <span className="text-muted-foreground/50">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Global Network Bottlenecks (Always visible or below search) */}
      <div className="flex flex-col mt-4">
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h4 className="font-bold text-foreground">Historical Network Bottlenecks</h4>
              <p className="text-xs text-muted-foreground">Top 5 highest average delay nodes network-wide (Historical Pattern)</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            {bottlenecks.map((b, i) => (
              <div key={b.code} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-muted-foreground w-6">0{i + 1}</span>
                  <div>
                    <p className="text-sm font-bold text-foreground">{b.name} <span className="text-muted-foreground font-normal">({b.code})</span></p>
                    <p className="text-xs text-muted-foreground">{b.affected_trains} trains analysed</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-red-500 font-bold bg-red-500/10 px-2 py-1 rounded text-sm">+{b.avg_delay} min</span>
                </div>
              </div>
            ))}
            {bottlenecks.length === 0 && (
              <p className="text-sm text-muted-foreground p-4 text-center">Loading network bottlenecks...</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
