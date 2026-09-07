"use client"

import * as React from "react"
import {
  Activity, AlertTriangle, ShieldCheck, Zap,
  BarChart3, Clock, TrainFront, ShieldAlert,
  ChevronRight, BrainCircuit, Navigation, Database,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { calculatePrediction } from "@/lib/ai/prediction"
import { cn } from "@/lib/utils"

// Interfaces matching the new API
interface FleetTrain {
  train_no: string;
  name: string;
  type: string;
  avg_delay: number;
  stations_analysed: number;
}

interface Bottleneck {
  code: string;
  name: string;
  zone: string;
  avg_delay: number;
  affected_trains: number;
}

interface DynamicAlert {
  id: string;
  type: "INFO" | "MEDIUM" | "HIGH";
  message: string;
  time: string;
}

export default function ControlRoomPage() {
  const [fleet, setFleet] = React.useState<FleetTrain[]>([]);
  const [bottlenecks, setBottlenecks] = React.useState<Bottleneck[]>([]);
  const [alerts, setAlerts] = React.useState<DynamicAlert[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedTrain, setSelectedTrain] = React.useState<FleetTrain | null>(null);

  React.useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/control-room/data');
        const json = await res.json();

        if (json.success) {
          setFleet(json.data.fleet);
          setBottlenecks(json.data.bottlenecks);

          // Generate Dynamic Alerts from data
          const newAlerts: DynamicAlert[] = [];
          const now = new Date();

          if (json.data.bottlenecks.length > 0) {
            const worst = json.data.bottlenecks[0];
            newAlerts.push({
              id: 'a1',
              type: 'HIGH',
              message: `Severe historical bottleneck identified at ${worst.name} (+${worst.avg_delay}m avg).`,
              time: now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
            });
          }

          if (json.data.fleet.length > 0) {
            const worstTrain = json.data.fleet[0];
            newAlerts.push({
              id: 'a2',
              type: worstTrain.avg_delay > 45 ? 'HIGH' : 'MEDIUM',
              message: `High historical delay pattern detected for ${worstTrain.name} (${worstTrain.train_no}).`,
              time: new Date(now.getTime() - 60000).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
            });
          }

          newAlerts.push({
            id: 'a3',
            type: 'INFO',
            message: `Loaded 38.4M historical telemetry events for risk analysis.`,
            time: new Date(now.getTime() - 120000).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
          });

          setAlerts(newAlerts);
        }
      } catch (err) {
        console.error("Failed to load control room data", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const getRiskLevel = (delay: number) => {
    if (delay > 45) return { label: 'CRITICAL', color: 'red', score: 30 };
    if (delay > 15) return { label: 'HIGH', color: 'orange', score: 60 };
    return { label: 'MEDIUM', color: 'yellow', score: 85 }; // We only query delayed trains, so none are strictly LOW
  }

  const activeTrains = fleet.length;
  const criticalTrains = fleet.filter(t => t.avg_delay > 45).length;
  const avgDelay = fleet.length > 0 ? Math.round(fleet.reduce((sum, t) => sum + t.avg_delay, 0) / fleet.length) : 0;
  const totalStations = bottlenecks.length;

  return (
    <div className="flex flex-col min-h-screen bg-background pb-10">

      {/* UTILITY BAR */}
      <div className="px-6 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-xs tracking-wider font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            REAL HISTORICAL DATA
          </Badge>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Railway Operations Intelligence
          </span>
        </div>
      </div>

      <main className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* LEFT / CENTER */}
        <div className="xl:col-span-8 flex flex-col gap-6">

          {/* HISTORICAL BOTTLENECKS (Replaces Map) */}
          <Card className="border-border bg-card shadow-xl flex flex-col backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-border bg-muted/50">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-2"><Database className="w-4 h-4" /> Top Historical Bottlenecks</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-muted/10">
              {loading ? (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {bottlenecks.map((station, idx) => {
                    // Simple relative width calculation
                    const maxDelay = bottlenecks[0]?.avg_delay || 1;
                    const widthPercent = Math.max(10, (station.avg_delay / maxDelay) * 100);

                    return (
                      <div key={station.code} className="flex items-center gap-4 relative">
                        <span className="text-xs font-mono font-bold text-muted-foreground w-6">0{idx + 1}</span>
                        <div className="w-[120px] shrink-0">
                          <p className="text-sm font-bold text-foreground truncate">{station.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">{station.zone}</p>
                        </div>
                        <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden flex items-center">
                          <div
                            className="h-full bg-red-500/80 rounded-r-full transition-all duration-1000 ease-out flex items-center justify-end px-2"
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-red-500 w-16 text-right">+{station.avg_delay}m</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* HIGH-RISK FLEET */}
          <Card className="border-border bg-card shadow-xl flex-1 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border bg-muted/50">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Historical Risk Fleet
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {loading ? (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Train</th>
                      <th className="px-6 py-4 font-semibold">Historical Risk</th>
                      <th className="px-6 py-4 font-semibold">Avg Delay</th>
                      <th className="px-6 py-4 font-semibold">ETA Risk Indicator</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {fleet.map((train) => {
                      const risk = getRiskLevel(train.avg_delay);
                      return (
                        <tr
                          key={train.train_no}
                          onClick={() => setSelectedTrain(train)}
                          className={cn(
                            "hover:bg-muted/50 cursor-pointer transition-colors",
                            selectedTrain?.train_no === train.train_no && "bg-info-blue/5 border-l-2 border-info-blue"
                          )}
                        >
                          <td className="px-6 py-4 font-bold flex flex-col gap-1 text-foreground">
                            <span className="flex items-center gap-2"><TrainFront className="w-4 h-4 text-muted-foreground" /> {train.train_no}</span>
                            <span className="text-xs text-muted-foreground font-normal truncate max-w-[200px]">{train.name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border",
                              risk.label === "CRITICAL" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                risk.label === "HIGH" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                                  "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                            )}>
                              {risk.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono">
                            <span className="text-red-500 font-semibold">+{train.avg_delay}m</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-muted-foreground uppercase">Prototype Score</span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className={cn("h-full", risk.score > 80 ? "bg-green-500" : risk.score > 50 ? "bg-info-blue" : "bg-red-500")} style={{ width: `${risk.score}%` }} />
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="xl:col-span-4 flex flex-col gap-6">

          {/* COMPACT AI INTELLIGENCE */}
          <Card className="border-info-blue/20 shadow-xl flex flex-col bg-card overflow-hidden">
            <CardHeader className="pb-3 border-b border-info-blue/10 bg-info-blue/5">
              <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-info-blue flex items-center justify-between">
                <span className="flex items-center gap-2"><BrainCircuit className="w-4 h-4" /> Prediction Engine</span>
                <Badge variant="outline" className="text-[9px] border-info-blue/20 text-info-blue bg-info-blue/10">PROTOTYPE SIMULATION</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {selectedTrain ? (() => {
                // Using the prototype calculation with our historical delay as the input
                const pred = calculatePrediction({
                  trainNumber: selectedTrain.train_no,
                  currentStation: "LIVE_NODE",
                  previousStation: "PREV_NODE",
                  nextStation: "NEXT_NODE",
                  delayMinutes: selectedTrain.avg_delay,
                  progressPercentage: 50,
                  expectedArrival: "12:00",
                  lastUpdated: new Date().toISOString(),
                  route: [],
                  isDemo: true
                });
                return (
                  <div className="p-6 flex flex-col gap-6 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Simulated Dynamic ETA</span>
                        <span className="text-4xl font-black tracking-tighter text-foreground">{pred.predictedEta}</span>
                      </div>
                      <div className={cn("px-3 py-1.5 rounded-lg text-sm font-black shadow-inner border", pred.totalDelayImpactMinutes > 0 ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-green-500/10 text-green-500 border-green-500/20")}>
                        {pred.totalDelayImpactMinutes > 0 ? "+" : ""}{pred.totalDelayImpactMinutes} min
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 bg-muted/30 p-4 rounded-xl border border-border">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Delay Attribution (Prototype)</span>
                      {pred.factors.map(f => (
                        <div key={f.id} className="flex justify-between items-center">
                          <span className="text-sm font-medium text-foreground/80">{f.name}</span>
                          <span className={cn("text-sm font-bold", f.impactMinutes > 0 ? "text-red-500" : "text-green-500")}>
                            {f.impactMinutes > 0 ? "+" : ""}{f.impactMinutes}m
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })() : (
                <div className="p-12 flex flex-col items-center justify-center text-center gap-4 text-muted-foreground">
                  <Activity className="w-8 h-8 opacity-50" />
                  <p className="text-sm font-medium">Select a train to view simulated predictions.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border shadow-xl flex-1 flex flex-col bg-card backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border bg-muted/50">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto max-h-100">
              {loading ? (
                <div className="p-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
              ) : (
                <div className="flex flex-col divide-y divide-border">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="p-4 flex gap-4 hover:bg-muted/50 transition-colors animate-in slide-in-from-right-4">
                      <div className="mt-1 shrink-0">
                        {alert.type === "HIGH" ? <ShieldAlert className="w-4 h-4 text-red-500" /> :
                          alert.type === "MEDIUM" ? <AlertTriangle className="w-4 h-4 text-orange-500" /> :
                            <Activity className="w-4 h-4 text-info-blue" />}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <p className="text-sm font-medium text-foreground leading-snug">{alert.message}</p>
                        <span className="text-[10px] font-mono text-muted-foreground">{alert.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </main>

      {/* BOTTOM METRICS */}
      <div className="px-6 mt-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="bg-card border-border shadow-xl">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Monitored Trains</span>
                <span className="text-3xl font-black text-foreground">{loading ? '-' : activeTrains}</span>
              </div>
              <TrainFront className="w-8 h-8 text-muted-foreground/50" />
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-xl">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Critical Risk Signals</span>
                <span className="text-3xl font-black text-red-500">{loading ? '-' : criticalTrains}</span>
              </div>
              <ShieldAlert className="w-8 h-8 text-red-500/20" />
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-xl">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Avg Risk Fleet Delay</span>
                <span className="text-3xl font-black text-foreground">{loading ? '-' : avgDelay} <span className="text-sm font-medium text-muted-foreground">min</span></span>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground/50" />
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-xl">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Top Bottlenecks</span>
                <span className="text-3xl font-black text-orange-500">{loading ? '-' : totalStations}</span>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500/20" />
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  )
}
