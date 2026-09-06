"use client"

import * as React from "react"
import { Activity, AlertTriangle, Play, Shuffle, BrainCircuit, Database, Network, ArrowRightLeft, Cpu } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NetworkMap } from "@/components/network/network-map"
import { initialNodes, initialEdges, initialTrains, type NetworkNode, type NetworkEdge, type NetworkTrain } from "@/lib/mock/network"
import { cn } from "@/lib/utils"

export default function NetworkPage() {
  const [nodes, setNodes] = React.useState<NetworkNode[]>(initialNodes);
  const [edges, setEdges] = React.useState<NetworkEdge[]>(initialEdges);
  const [trains, setTrains] = React.useState<NetworkTrain[]>(initialTrains);

  const [scenario, setScenario] = React.useState<"normal" | "simulating" | "disrupted">("normal");
  const [alerts, setAlerts] = React.useState<{ id: string, text: string, type: "info" | "warning" | "error" }[]>([
    { id: "init", text: "Network operating normally. All ETAs within expected variance.", type: "info" }
  ]);

  // LIVE CRAZY ANIMATION LOOP
  React.useEffect(() => {
    if (scenario !== "normal") return;
    const interval = setInterval(() => {
      setTrains(prev => prev.map(t => {
        let nextProgress = t.progress + (Math.random() * 0.8 + 0.2);
        if (nextProgress > 100) nextProgress = 0;
        return { ...t, progress: nextProgress };
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, [scenario]);

  const addAlert = (text: string, type: "info" | "warning" | "error") => {
    setAlerts(prev => [{ id: crypto.randomUUID(), text, type }, ...prev].slice(0, 5));
  }

  const handleSimulateDisruption = () => {
    if (scenario !== "normal") return;
    setScenario("simulating");
    setAlerts([]);
    addAlert("Initiating simulation: Injecting unscheduled stoppage...", "info");

    setTimeout(() => {
      setNodes(prev => prev.map(n => n.id === "RTM" ? { ...n, status: "Disruption" } : n));
      addAlert("Major Disruption detected at Ratlam (RTM). Track obstruction.", "error");
    }, 1000);

    setTimeout(() => {
      setEdges(prev => prev.map(e =>
        e.id === "e4" ? { ...e, status: "Heavy" } :
          e.id === "e5" ? { ...e, status: "Disruption" } :
            e
      ));
      addAlert("Congestion cascading to Vadodara-Ratlam segment (Heavy traffic).", "warning");
    }, 2500);

    setTimeout(() => {
      setTrains(prev => prev.map(t => {
        if (t.id === "t2") {
          return { ...t, status: "delayed", delayMinutes: 45, dynamicEta: "20:00" };
        }
        if (t.id === "t3") {
          return { ...t, status: "delayed", delayMinutes: 15, dynamicEta: "20:20" };
        }
        if (t.id === "t1") {
          return { ...t, status: "delayed", delayMinutes: 10, dynamicEta: "18:50" };
        }
        return t;
      }));

      addAlert("GATI DRISHTI AI: Recalculating ETAs across network...", "info");

      setTimeout(() => {
        addAlert("Train 12903 ETA updated: +45m due to RTM congestion.", "warning");
        addAlert("Train 12951 ETA updated: +10m due to cascading delay.", "warning");
        setScenario("disrupted");
      }, 1000);

    }, 4000);
  }

  const handleReset = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setTrains(initialTrains);
    setScenario("normal");
    setAlerts([{ id: crypto.randomUUID(), text: "Network reset to normal operations.", type: "info" }]);
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3 text-foreground">
            <Activity className="w-8 h-8 text-info-blue" />
            Network Intelligence Core
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Inside the AI pipeline powering GATI DRISHTI's dynamic ETAs and crossing predictions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {scenario === "normal" ? (
            <Button
              onClick={handleSimulateDisruption}
              className="bg-alert-red hover:bg-alert-red/90 text-white font-bold gap-2 shadow-lg shadow-alert-red/20"
            >
              <AlertTriangle className="w-4 h-4" />
              Simulate Disruption
            </Button>
          ) : (
            <Button
              onClick={handleReset}
              variant="outline"
              className="gap-2"
              disabled={scenario === "simulating"}
            >
              <Shuffle className="w-4 h-4" />
              Reset Network
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* LEFT COLUMN: Map & Data Pipeline */}
        <div className="xl:col-span-8 flex flex-col gap-8">

          {/* Main Map View */}
          <Card className="border-border shadow-lg overflow-hidden relative group/card">
            <div className={cn(
              "absolute top-0 left-0 w-1.5 h-full transition-colors z-10",
              scenario === "normal" ? "bg-info-blue" : "bg-alert-red"
            )} />
            <CardHeader className="pb-4 pt-6 px-8 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    Live Route Simulation
                  </CardTitle>
                  <CardDescription>Mumbai — Delhi Corridor (WR) visualizer</CardDescription>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={cn(
                    "px-3 py-1 font-mono text-xs font-bold tracking-widest hidden sm:flex",
                    scenario === "normal" ? "text-railway-green border-railway-green bg-railway-green/10" :
                      scenario === "simulating" ? "text-alert-orange border-alert-orange bg-alert-orange/10 animate-pulse" :
                        "text-alert-red border-alert-red bg-alert-red/10"
                  )}>
                    {scenario === "normal" ? "STATUS: NORMAL" : scenario === "simulating" ? "ANALYSING..." : "MAJOR DISRUPTION"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 bg-zinc-950 relative">
              <NetworkMap nodes={nodes} edges={edges} trains={trains} />
            </CardContent>
          </Card>

          {/* AI Pipeline Card - Fixed Layout */}
          <Card className="border-border shadow-sm">
            <CardHeader className="bg-muted/20 border-b border-border">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Database className="w-5 h-5 text-purple-500" />
                AI Training & Historical Data Pipeline
              </CardTitle>
              <CardDescription>How we aggregate NTES data to train predictive models.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 overflow-x-auto pb-2">
                <div className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-card border border-border shadow-sm w-full min-w-[200px]">
                  <Database className="w-8 h-8 text-zinc-400" />
                  <span className="text-sm font-bold text-foreground">Data Mining</span>
                  <span className="text-xs text-muted-foreground leading-relaxed">Scraping historical NTES logs & weather APIs.</span>
                </div>
                <div className="hidden md:flex shrink-0">
                  <ArrowRightLeft className="w-6 h-6 text-muted-foreground opacity-50" />
                </div>
                <div className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-card border border-border shadow-sm w-full min-w-[200px]">
                  <Cpu className="w-8 h-8 text-info-blue" />
                  <span className="text-sm font-bold text-foreground">Feature Engineering</span>
                  <span className="text-xs text-muted-foreground leading-relaxed">Node congestion, day-of-week, seasonal variances.</span>
                </div>
                <div className="hidden md:flex shrink-0">
                  <ArrowRightLeft className="w-6 h-6 text-muted-foreground opacity-50" />
                </div>
                <div className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-primary/5 border border-primary/20 shadow-sm relative overflow-hidden w-full min-w-[200px]">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-full -z-10 blur-xl" />
                  <BrainCircuit className="w-8 h-8 text-primary" />
                  <span className="text-sm font-bold text-foreground">GATI Engine</span>
                  <span className="text-xs text-muted-foreground leading-relaxed">XGBoost model predicting cascading delay minutes.</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN: Crossings & Alerts */}
        <div className="xl:col-span-4 flex flex-col gap-8">

          {/* Crossing Logic Card - Fixed Theme */}
          <Card className="border-border shadow-lg bg-gradient-to-br from-card to-muted/20">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <ArrowRightLeft className="w-5 h-5 text-railway-green" />
                Overtake & Crossing Prediction
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                By analyzing the live velocity of trains on shared network edges, our system mathematically flags probable crossing and overtaking events.
              </p>

              <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-muted-foreground uppercase">Express</span>
                    <div className="text-sm font-bold text-foreground flex items-center gap-2">
                      12951 <Badge variant="outline" className="bg-railway-green/10 text-railway-green border-railway-green/20">110 km/h</Badge>
                    </div>
                  </div>
                  <div className="w-16 h-[2px] bg-border relative">
                    <div className="absolute top-1/2 right-0 w-3 h-3 bg-railway-green rounded-full -translate-y-1/2 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-muted-foreground uppercase">Freight</span>
                    <div className="text-sm font-bold text-foreground flex items-center gap-2">
                      BOXN-R <Badge variant="outline" className="bg-info-blue/10 text-info-blue border-info-blue/20">60 km/h</Badge>
                    </div>
                  </div>
                  <div className="w-24 h-[2px] bg-border relative">
                    <div className="absolute top-1/2 right-4 w-3 h-3 bg-info-blue rounded-full -translate-y-1/2" />
                  </div>
                </div>

                <div className="pt-3 border-t border-border mt-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Predicted Overtake</span>
                    <span className="font-mono text-alert-orange font-bold">in 14 mins</span>
                  </div>
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span className="text-muted-foreground">Node</span>
                    <span className="font-mono text-foreground font-semibold">BHARUCH (BH) Loop</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Alerts Panel */}
          <Card className="border-border shadow-sm flex flex-col">
            <CardHeader className="pb-3 border-b border-border bg-muted/30">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Live System Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col gap-3 min-h-[250px]">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={cn(
                    "p-3 rounded-md text-sm font-medium border animate-in slide-in-from-right-4 duration-300",
                    alert.type === "error" ? "bg-alert-red/10 border-alert-red/20 text-alert-red" :
                      alert.type === "warning" ? "bg-alert-orange/10 border-alert-orange/20 text-alert-orange" :
                        "bg-info-blue/5 border-info-blue/10 text-info-blue"
                  )}
                >
                  {alert.text}
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  Waiting for network events...
                </div>
              )}
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  )
}
