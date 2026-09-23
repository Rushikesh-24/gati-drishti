"use client"

import * as React from "react"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { History, TrendingDown, Target, Lightbulb, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { generateHistoricalIntelligence } from "@/lib/mock/historical"

interface HistoricalPanelProps {
  trainNumber: string;
}

export function HistoricalPanel({ trainNumber }: HistoricalPanelProps) {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        // Get fallback mock data for things we don't have in DB (like journey history)
        const mockData = generateHistoricalIntelligence(trainNumber);
        
        // Fetch real delays
        const res = await fetch(`/api/intelligence/train/${trainNumber}`);
        const json = await res.json();
        
        if (json.success && json.data.route && json.data.route.length > 0) {
          const route = json.data.route;
          
          let totalDelay = 0;
          let delayCount = 0;
          
          const realStationDelays = route.map((r: any, idx: number) => {
            const currentDelay = r.avg_delay !== null ? r.avg_delay : 0;
            const prevDelay = idx > 0 && route[idx-1].avg_delay !== null ? route[idx-1].avg_delay : currentDelay;
            const recovery = currentDelay < prevDelay ? prevDelay - currentDelay : 0;
            
            if (r.avg_delay !== null) {
              totalDelay += r.avg_delay;
              delayCount++;
            }
            
            return {
              station: r.code,
              avgDelay: Math.max(0, currentDelay),
              recovery: Math.max(0, recovery)
            };
          });

          // Filter out stations with no delay data at all if there are too many
          const filteredStations = realStationDelays.filter((s: any) => s.avgDelay > 0 || s.recovery > 0);
          
          const realAvgDelay = delayCount > 0 ? Math.round(totalDelay / delayCount) : mockData.avgDelayOverall;
          
          if (isMounted) {
            setData({
              ...mockData,
              avgDelayOverall: realAvgDelay,
              stationDelays: filteredStations.length > 0 ? filteredStations : realStationDelays,
              insights: [
                `Real historical data analyzed across ${route.length} stations.`,
                `Current network average delay profile is ${realAvgDelay} min.`,
                ...mockData.insights.slice(1)
              ]
            });
          }
        } else {
          // Fallback to mock if API fails or no route data
          if (isMounted) setData(mockData);
        }
      } catch (err) {
        console.error("Failed to fetch real historical data:", err);
        if (isMounted) setData(generateHistoricalIntelligence(trainNumber));
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    
    return () => { isMounted = false; };
  }, [trainNumber]);

  if (loading || !data) return <div className="h-96 w-full animate-pulse bg-muted rounded-md" />;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <History className="w-5 h-5 text-muted-foreground" />
          Historical Intelligence
        </h3>
        <Badge variant="outline" className="border-border text-muted-foreground">
          HISTORICAL SIMULATION
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric Cards */}
        <Card className="bg-card shadow-sm border-border">
          <CardContent className="p-6 flex flex-col gap-2 text-center items-center justify-center h-full">
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" /> Avg Delay
            </span>
            <span className="text-4xl font-black text-alert-orange mt-2">
              {data.avgDelayOverall} <span className="text-lg font-medium text-muted-foreground">min</span>
            </span>
          </CardContent>
        </Card>
        
        <Card className="bg-card shadow-sm border-border">
          <CardContent className="p-6 flex flex-col gap-2 text-center items-center justify-center h-full">
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4" /> On-Time Performance
            </span>
            <span className="text-4xl font-black text-railway-green mt-2">
              {data.onTimePercentage}%
            </span>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="bg-info-blue/5 border-info-blue/20 shadow-sm md:col-span-1">
          <CardContent className="p-5 flex flex-col h-full">
            <span className="text-xs font-bold uppercase tracking-wider text-info-blue flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4" /> AI Insights
            </span>
            <ul className="flex flex-col gap-3">
              {data.insights.map((insight: string, idx: number) => (
                <li key={idx} className="text-sm text-foreground/90 leading-tight flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-info-blue mt-1.5 shrink-0" />
                  {insight}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Journey History Chart */}
        <Card className="bg-card shadow-sm border-border">
          <CardHeader className="pb-2 border-b border-border mb-4">
            <CardTitle className="text-base font-semibold">Delay Variance (Last 30 Journeys)</CardTitle>
          </CardHeader>
          <CardContent className="h-64 px-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.journeyHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} 
                  axisLine={false}
                  tickLine={false}
                  minTickGap={20}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val}m`}
                />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <ReferenceLine y={data.avgDelayOverall} stroke="var(--color-alert-orange)" strokeDasharray="3 3" label={{ position: 'top', value: 'Avg', fill: 'var(--color-alert-orange)', fontSize: 10 }} />
                <Line 
                  type="monotone" 
                  dataKey="delay" 
                  stroke="var(--color-info-blue)" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: 'var(--color-info-blue)' }}
                  name="Delay (min)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Station Bottlenecks Chart */}
        <Card className="bg-card shadow-sm border-border">
          <CardHeader className="pb-2 border-b border-border mb-4">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              Station Bottlenecks
              <span className="text-xs font-normal text-muted-foreground flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-railway-green" /> Recovery Indicator
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64 px-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.stationDelays} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="station" 
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val}m`}
                />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                />
                <Bar 
                  dataKey="avgDelay" 
                  fill="var(--color-alert-red)" 
                  radius={[4, 4, 0, 0]}
                  name="Avg Accumulated Delay"
                  stackId="a"
                />
                <Bar 
                  dataKey="recovery" 
                  fill="var(--color-railway-green)" 
                  radius={[0, 0, 4, 4]}
                  name="Avg Recovery"
                  stackId="b"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
