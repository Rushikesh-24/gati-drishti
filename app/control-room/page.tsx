"use client"

import * as React from "react"
import {
  Activity, AlertTriangle, ShieldCheck, Zap,
  BarChart3, Clock, TrainFront, ShieldAlert,
  ChevronRight, BrainCircuit, Navigation
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NetworkMap } from "@/components/network/network-map"
import { calculatePrediction } from "@/lib/ai/prediction"
import { initialNodes, initialEdges } from "@/lib/mock/network"
import {
  initialControlTrains,
  initialControlAlerts,
  initialInsights,
  type ControlTrain,
  type ControlAlert
} from "@/lib/mock/control-room"
import { cn } from "@/lib/utils"

export default function ControlRoomPage() {
  const [nodes, setNodes] = React.useState(initialNodes);
  const [edges, setEdges] = React.useState(initialEdges);
  const [trains, setTrains] = React.useState<ControlTrain[]>(initialControlTrains);
  const [alerts, setAlerts] = React.useState<ControlAlert[]>(initialControlAlerts);
  const [insights, setInsights] = React.useState<string[]>(initialInsights);

  const [scenario, setScenario] = React.useState<"normal" | "disrupted">("normal");
  const [selectedTrain, setSelectedTrain] = React.useState<ControlTrain | null>(null);

  const addAlert = (type: "INFO" | "MEDIUM" | "HIGH", message: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    setAlerts(prev => [{ id: crypto.randomUUID(), type, message, time }, ...prev].slice(0, 10));
  }

  const handleSimulateDisruption = () => {
    if (scenario === "disrupted") {
      setNodes(initialNodes);
      setEdges(initialEdges);
      setTrains(initialControlTrains);
      setAlerts(initialControlAlerts);
      setInsights(initialInsights);
      setScenario("normal");
      return;
    }

    addAlert("HIGH", "Network congestion detected at RTM junction.");
    setNodes(prev => prev.map(n => n.id === "RTM" ? { ...n, status: "Disruption" } : n));
    setEdges(prev => prev.map(e =>
      e.id === "e4" ? { ...e, status: "Heavy" } :
        e.id === "e5" ? { ...e, status: "Disruption" } : e
    ));

    setTrains(prev => prev.map(t => {
      if (t.id === "t2") return { ...t, status: "CRITICAL", delay: 45, eta: "20:00", confidence: 60, risk: "HIGH" };
      if (t.id === "t3") return { ...t, status: "DELAYED", delay: 15, eta: "20:20", confidence: 75, risk: "MEDIUM" };
      if (t.id === "t1") return { ...t, status: "DELAYED", delay: 10, eta: "18:50", confidence: 80, risk: "MEDIUM" };
      return t;
    }));

    setInsights([
      "3 trains experiencing secondary delay cascading from RTM.",
      "12903 requires immediate rescheduling.",
      "Congestion expected to clear in 2 hours."
    ]);

    setScenario("disrupted");
    setTimeout(() => {
      addAlert("MEDIUM", "Train 12903 ETA changed by +45 min");
      addAlert("MEDIUM", "Train 12951 ETA changed by +10 min");
    }, 1000);
  }

  const activeTrains = trains.length;
  const delayedTrains = trains.filter(t => t.status !== "ON-TIME").length;
  const avgDelay = Math.round(trains.reduce((sum, t) => sum + t.delay, 0) / (trains.length || 1));
  const highRisk = trains.filter(t => t.risk === "HIGH").length;

  return (
    <div className="flex flex-col min-h-screen bg-background pb-10">

      {/* UTILITY BAR */}
      <div className="px-6 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted/80 border-border px-3 py-1 text-xs tracking-wider font-semibold">DEMO ENVIRONMENT</Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-colors",
            scenario === "normal" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
          )}>
            <span className={cn("w-2 h-2 rounded-full animate-pulse", scenario === "normal" ? "bg-green-500" : "bg-red-500")} />
            {scenario === "normal" ? "SYSTEM OPERATIONAL" : "NETWORK DISRUPTION"}
          </div>
        </div>
      </div>

      <main className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* LEFT / CENTER */}
        <div className="xl:col-span-8 flex flex-col gap-6">

          <Card className="border-border bg-card shadow-xl flex flex-col backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-border bg-muted/50">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-2"><Navigation className="w-4 h-4" /> Network Topography</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSimulateDisruption}
                  className={cn(
                    "h-7 text-[10px] border-border hover:bg-muted",
                    scenario === "normal" ? "text-muted-foreground" : "bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20"
                  )}
                >
                  <Zap className="w-3 h-3 mr-1" /> {scenario === "normal" ? "SIMULATE DISRUPTION" : "RESET NETWORK"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative bg-muted/20">
              <NetworkMap
                nodes={nodes}
                edges={edges}
                trains={trains.map(t => ({
                  id: t.id,
                  number: t.number,
                  name: t.name,
                  edgeId: t.edgeId,
                  progress: t.progress,
                  baseEta: t.eta,
                  dynamicEta: t.eta,
                  delayMinutes: t.delay,
                  status: t.status === "ON-TIME" ? "on-time" : t.status === "CRITICAL" ? "stopped" : "delayed"
                }))}
              />
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-xl flex-1 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border bg-muted/50">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Active Fleet
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Train</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Delay</th>
                    <th className="px-6 py-4 font-semibold">AI ETA</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {trains.map((train) => (
                    <tr
                      key={train.id}
                      onClick={() => setSelectedTrain(train)}
                      className={cn(
                        "hover:bg-muted/50 cursor-pointer transition-colors",
                        selectedTrain?.id === train.id && "bg-info-blue/5 border-l-2 border-info-blue"
                      )}
                    >
                      <td className="px-6 py-4 font-bold flex flex-col gap-1 text-foreground">
                        <span className="flex items-center gap-2"><TrainFront className="w-4 h-4 text-muted-foreground" /> {train.number}</span>
                        <span className="text-xs text-muted-foreground font-normal">{train.route}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border",
                          train.status === "ON-TIME" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                            train.status === "DELAYED" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                              "bg-red-500/10 text-red-500 border-red-500/20"
                        )}>
                          {train.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono">
                        {train.delay > 0 ? <span className="text-red-500 font-semibold">+{train.delay}m</span> : <span className="text-muted-foreground">--</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-foreground">{train.eta}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                              <div className={cn("h-full", train.confidence > 85 ? "bg-green-500" : train.confidence > 70 ? "bg-info-blue" : "bg-orange-500")} style={{ width: `${train.confidence}%` }} />
                            </div>
                            <span className="text-[10px] text-muted-foreground">{train.confidence}%</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="xl:col-span-4 flex flex-col gap-6">

          {/* COMPACT AI INTELLIGENCE */}
          <Card className="border-info-blue/20 shadow-xl flex flex-col bg-card overflow-hidden">
            <CardHeader className="pb-3 border-b border-info-blue/10 bg-info-blue/5">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-info-blue flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" /> AI Trajectory Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {selectedTrain ? (() => {
                const pred = calculatePrediction({
                  trainNumber: selectedTrain.number,
                  currentStation: "KOTA",
                  previousStation: "RTM",
                  nextStation: "SWM",
                  delayMinutes: selectedTrain.delay,
                  progressPercentage: selectedTrain.progress,
                  expectedArrival: selectedTrain.eta,
                  lastUpdated: new Date().toISOString(),
                  route: [],
                  isDemo: true
                });
                return (
                  <div className="p-6 flex flex-col gap-6 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Dynamic ETA</span>
                        <span className="text-4xl font-black tracking-tighter text-foreground">{pred.predictedEta}</span>
                      </div>
                      <div className={cn("px-3 py-1.5 rounded-lg text-sm font-black shadow-inner border", pred.totalDelayImpactMinutes > 0 ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-green-500/10 text-green-500 border-green-500/20")}>
                        {pred.totalDelayImpactMinutes > 0 ? "+" : ""}{pred.totalDelayImpactMinutes} min
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 bg-muted/30 p-4 rounded-xl border border-border">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Delay Attribution</span>
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
                  <p className="text-sm font-medium">Select a train to view predictive intelligence.</p>
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
            <CardContent className="p-0 overflow-y-auto max-h-[400px]">
              <div className="flex flex-col divide-y divide-border">
                {alerts.map(alert => (
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
            </CardContent>
          </Card>
        </div>

      </main>

      {/* BOTTOM */}
      <div className="px-6 mt-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="bg-card border-border shadow-xl">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Active Trains</span>
                <span className="text-3xl font-black text-foreground">{activeTrains}</span>
              </div>
              <TrainFront className="w-8 h-8 text-muted-foreground/50" />
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-xl">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Delayed Trains</span>
                <span className="text-3xl font-black text-orange-500">{delayedTrains}</span>
              </div>
              <Clock className="w-8 h-8 text-orange-500/20" />
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-xl">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Avg Network Delay</span>
                <span className="text-3xl font-black text-foreground">{avgDelay} <span className="text-sm font-medium text-muted-foreground">min</span></span>
              </div>
              <BarChart3 className="w-8 h-8 text-muted-foreground/50" />
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-xl">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">High-Risk Profiles</span>
                <span className="text-3xl font-black text-red-500">{highRisk}</span>
              </div>
              <ShieldAlert className="w-8 h-8 text-red-500/20" />
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  )
}
