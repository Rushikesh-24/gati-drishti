"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Terminal, Server, BrainCircuit, Activity, CheckCircle2, History, Building2, Webhook, Play, Loader2 } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

function EndpointCard({ endpoint }: { endpoint: any }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [liveResponse, setLiveResponse] = useState<any>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  // Dynamic state for path params or JSON body
  const [paramInput, setParamInput] = useState(endpoint.defaultParam || "");
  const [bodyInput, setBodyInput] = useState(endpoint.defaultBody || "");

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  }

  const handleSimulate = async () => {
    setLoading(true);
    setLiveResponse(null);
    setStatusCode(null);

    try {
      let finalPath = endpoint.path;
      if (endpoint.hasParam) {
        if (finalPath.includes("{id}")) {
          finalPath = finalPath.replace("{id}", encodeURIComponent(paramInput || "demo"));
        } else if (finalPath.includes("{query}")) {
          finalPath = finalPath.replace("{query}", encodeURIComponent(paramInput || ""));
        } else if (endpoint.queryKey) {
          finalPath = finalPath + "?" + endpoint.queryKey + "=" + encodeURIComponent(paramInput || "");
        } else {
          finalPath = finalPath + "?q=" + encodeURIComponent(paramInput || "");
        }
      }

      const options: RequestInit = {
        method: endpoint.method,
        headers: { "Content-Type": "application/json" }
      };

      if (endpoint.method === "POST") {
        options.body = bodyInput;
      }

      const res = await fetch(finalPath, options);
      const data = await res.json();

      setStatusCode(res.status);
      setLiveResponse(data);
    } catch (err) {
      setStatusCode(500);
      setLiveResponse({ success: false, error: "Network fetch failed." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-border shadow-lg overflow-hidden relative group/card">
      <div className={cn(
        "absolute top-0 left-0 w-1.5 h-full transition-colors",
        endpoint.method === "GET" ? "bg-info-blue" : "bg-railway-green"
      )} />

      <CardHeader className="bg-card border-b border-border pb-6 pt-6 px-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-muted/50 border border-border shadow-sm">
              {endpoint.icon}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <CardTitle className="text-2xl font-bold">{endpoint.title}</CardTitle>
                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">{endpoint.tag}</Badge>
              </div>
              <CardDescription className="text-sm leading-relaxed max-w-2xl text-muted-foreground">
                {endpoint.description}
              </CardDescription>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between bg-zinc-950 px-4 py-3 rounded-lg border border-zinc-800 group shadow-inner">
          <div className="flex items-center gap-4 no-translate">
            <span className={cn(
              "font-mono text-sm font-black tracking-widest",
              endpoint.method === "GET" ? "text-info-blue" : "text-railway-green"
            )}>
              {endpoint.method}
            </span>
            <code className="text-sm font-mono text-zinc-300 font-semibold tracking-tight">{endpoint.path}</code>
          </div>
          <button
            onClick={() => handleCopy(endpoint.path)}
            className="text-zinc-500 hover:text-white transition-colors p-1"
            title="Copy to clipboard"
          >
            {copied === endpoint.path ? <CheckCircle2 className="w-5 h-5 text-railway-green" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        {/* INTERACTIVE SIMULATOR INPUTS */}
        <div className="mt-4 flex flex-col gap-3 bg-muted/20 border border-border p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Simulation Sandbox</span>
            <button
              onClick={handleSimulate}
              disabled={loading}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded bg-primary text-primary-foreground text-xs font-bold transition-all hover:bg-primary/90 disabled:opacity-50",
                endpoint.method === "GET" ? "bg-info-blue text-white hover:bg-info-blue/90" : "bg-railway-green text-white hover:bg-railway-green/90"
              )}
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {loading ? "EXECUTING..." : "SEND REQUEST"}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {endpoint.hasParam && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">{endpoint.paramLabel || "ID Parameter"}</label>
                <input
                  type="text"
                  value={paramInput}
                  onChange={e => setParamInput(e.target.value)}
                  className="bg-background border border-border rounded px-3 py-1.5 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full max-w-xs"
                />
              </div>
            )}

            {endpoint.method === "POST" && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">JSON Body</label>
                <textarea
                  value={bodyInput}
                  onChange={e => setBodyInput(e.target.value)}
                  rows={4}
                  className="bg-background border border-border rounded px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full resize-none"
                />
              </div>
            )}
          </div>
        </div>

      </CardHeader>

      <CardContent className="p-0 bg-[#0d1117] flex flex-col">
        {/* If live response exists, show it instead of static mocks */}
        {liveResponse ? (
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-6 py-2.5 bg-[#161b22] border-b border-white/5">
              <div className="flex items-center gap-3 no-translate">
                <span className={cn(
                  "text-xs font-mono font-bold px-2 py-0.5 rounded",
                  statusCode && statusCode >= 200 && statusCode < 300 ? "bg-green-500/10 text-green-400" :
                    statusCode && statusCode >= 400 ? "bg-red-500/10 text-red-400" : "bg-zinc-800 text-zinc-300"
                )}>
                  {statusCode}
                </span>
                <span className="text-xs font-mono text-zinc-400">Live Server Response</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider no-translate animate-pulse">LIVE</span>
            </div>
            <pre className="px-6 py-4 overflow-x-auto text-sm font-mono text-[#79c0ff] leading-relaxed no-translate" translate="no">
              <code>{JSON.stringify(liveResponse, null, 2)}</code>
            </pre>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-white/5 opacity-70 group-hover/card:opacity-100 transition-opacity">
            {endpoint.responses.map((resp: any, idx: number) => (
              <div key={idx} className="flex flex-col">
                <div className="flex items-center justify-between px-6 py-2.5 bg-[#161b22]">
                  <div className="flex items-center gap-3 no-translate">
                    <span className={cn(
                      "text-xs font-mono font-bold px-2 py-0.5 rounded",
                      resp.code >= 200 && resp.code < 300 ? "bg-green-500/10 text-green-400" :
                        resp.code >= 400 ? "bg-red-500/10 text-red-400" : "bg-zinc-800 text-zinc-300"
                    )}>
                      {resp.code}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">{resp.desc} (Example)</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider no-translate">application/json</span>
                </div>
                <pre className="px-6 py-4 overflow-x-auto text-sm font-mono text-[#c9d1d9] leading-relaxed no-translate" translate="no">
                  <code>{resp.payload}</code>
                </pre>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function ApiPortalPage() {
  const endpoints = [
    {
      method: "GET",
      path: "/api/stations/search?q={query}",
      hasParam: true,
      queryKey: "q",
      paramLabel: "Search Query",
      defaultParam: "delhi",
      title: "Search Stations",
      description: "Search for railway stations across India by name or station code. Returns a comprehensive list of matching nodes.",
      icon: <Server className="w-5 h-5 text-purple-400" />,
      tag: "Directory API",
      responses: [
        { code: 200, desc: "Success", payload: `{\n  "success": true,\n  "data": [\n    {\n      "name": "NEW DELHI",\n      "code": "NDLS",\n      "state": "Delhi",\n      "zone": "NR",\n      "latitude": 28.642512,\n      "longitude": 77.21832,\n      "isJunction": false,\n      "routeCount": 0\n    }\n  ]\n}` },
      ]
    },
    {
      method: "GET",
      path: "/api/stations/{id}",
      hasParam: true,
      paramLabel: "Station Code",
      defaultParam: "NDLS",
      title: "Station Details",
      description: "Get detailed information about a specific railway station using its unique station code.",
      icon: <Building2 className="w-5 h-5 text-pink-400" />,
      tag: "Directory API",
      responses: [
        { code: 200, desc: "Success", payload: `{\n  "success": true,\n  "data": {\n    "name": "NEW DELHI",\n    "code": "NDLS",\n    "state": "Delhi",\n    "zone": "NR",\n    "latitude": 28.642512,\n    "longitude": 77.21832,\n    "isJunction": false,\n    "routeCount": 0\n  }\n}` },
        { code: 404, desc: "Not Found", payload: `{\n  "success": false,\n  "error": "Station not found"\n}` }
      ]
    },
    {
      method: "GET",
      path: "/api/trains/{id}/live",
      hasParam: true,
      paramLabel: "Train Number",
      defaultParam: "12951",
      title: "Real-Time Train Telemetry",
      description: "Retrieves live geospatial location, precise delays, and full route node data. Automatically switches between origin-departure logic and mid-journey tracking schemas.",
      icon: <Server className="w-5 h-5 text-info-blue" />,
      tag: "Core API",
      responses: [
        { code: 200, desc: "Success", payload: `{\n  "success": true,\n  "data": {\n    "trainNumber": "12002",\n    "currentStation": "BINA JN",\n    "nextStation": "BHOPAL JN",\n    "delayMinutes": 0,\n    "progressPercentage": 80,\n    "expectedArrival": "14:40",\n    "lastUpdated": "Crossed SORAI~ at 13:36",\n    "route": [\n      { "code": "NDLS", "name": "NEW DELHI", "status": "COMPLETED" },\n      { "code": "BINA", "name": "BINA JN", "status": "CURRENT" },\n      { "code": "RKMP", "name": "RANI KAMLAPATI", "status": "UPCOMING" }\n    ]\n  }\n}` },
      ]
    },
    {
      method: "GET",
      path: "/api/trains/{id}/eta",
      hasParam: true,
      paramLabel: "Train Number",
      defaultParam: "12951",
      title: "Predictive ETA Intelligence",
      description: "Queries the GATI DRISHTI inference engine. Returns an AI-generated ETA taking into account cascading network delays, weather, and historical junction bottlenecks.",
      icon: <BrainCircuit className="w-5 h-5 text-railway-green" />,
      tag: "AI Engine",
      responses: [
        { code: 200, desc: "Success", payload: `{\n  "success": true,\n  "data": {\n    "trainNumber": "12002",\n    "prediction": {\n      "expectedDelayMinutes": 12,\n      "confidenceScore": 89,\n      "riskLevel": "LOW",\n      "factors": [\n        { "factor": "Network Congestion", "impact": "High" }\n      ]\n    }\n  }\n}` }
      ]
    },
    {
      method: "GET",
      path: "/api/trains/{id}/history",
      hasParam: true,
      paramLabel: "Train Number",
      defaultParam: "12951",
      title: "Historical Delay Variance",
      description: "Aggregates performance over the last 30 journeys, outputting median delays per station to identify chronic infrastructure bottlenecks.",
      icon: <History className="w-5 h-5 text-purple-500" />,
      tag: "Analytics",
      responses: [
        { code: 200, desc: "Success", payload: `{\n  "success": true,\n  "data": {\n    "trainNumber": "12002",\n    "onTimePercentage": 82,\n    "avgDelayOverall": 14,\n    "bottlenecks": [\n      { "station": "MTJ", "avgDelay": 18, "recoveryRate": 0.4 }\n    ]\n  }\n}` }
      ]
    },
    {
      method: "GET",
      path: "/api/network/alerts",
      hasParam: false,
      title: "Global Network Congestion",
      description: "Provides a live socket-like snapshot of severe network events, speed restrictions, and track maintenance overriding normal operations.",
      icon: <Activity className="w-5 h-5 text-alert-orange" />,
      tag: "Core API",
      responses: [
        { code: 200, desc: "Success", payload: `{\n  "success": true,\n  "data": [\n    {\n      "id": "alert-772",\n      "type": "HIGH",\n      "node": "ST",\n      "message": "Major congestion detected at Surat Junction.",\n      "timestamp": "2026-09-06T07:54:00.000Z"\n    }\n  ]\n}` }
      ]
    },
    {
      method: "POST",
      path: "/api/webhooks/subscribe",
      hasParam: false,
      defaultBody: `{\n  "targetUrl": "https://myapp.com/api/webhooks/gati",\n  "trainNumber": "12951",\n  "thresholdMinutes": 30\n}`,
      title: "Event-Driven Webhooks",
      description: "Registers a target URL to receive push events when a specified train crosses a threshold delay (e.g., > 30 mins).",
      icon: <Webhook className="w-5 h-5 text-pink-500" />,
      tag: "Integration",
      responses: [
        { code: 201, desc: "Created", payload: `{\n  "success": true,\n  "webhookId": "wh_99x82jf",\n  "status": "Active"\n}` },
        { code: 400, desc: "Bad Request", payload: `{\n  "success": false,\n  "error": "Invalid target URL payload."\n}` }
      ]
    }
  ];

  return (
    <div className="flex flex-col flex-1 p-4 md:p-8 space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto w-full">

      {/* Header Section */}
      <div className="flex flex-col gap-4 bg-card p-8 rounded-2xl border border-border shadow-sm">
        <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3 text-foreground">
          <Terminal className="w-10 h-10 text-primary" />
          API Documentation
        </h1>
        <p className="text-muted-foreground text-lg max-w-4xl leading-relaxed">
          The GATI DRISHTI REST API allows you to build custom railway logistics apps, power station display boards, and automate freight operations. Our endpoints are fully <strong className="text-foreground">CORS-enabled</strong> and support high-throughput polling.
        </p>
        <div className="flex flex-wrap items-center gap-4 mt-2">
          <Badge variant="secondary" className="px-3 py-1 font-mono text-xs">v2.1.0-beta</Badge>
          <Badge variant="outline" className="px-3 py-1 font-mono text-xs border-railway-green text-railway-green bg-railway-green/5">99.9% Uptime</Badge>
          <Badge variant="outline" className="px-3 py-1 font-mono text-xs border-info-blue text-info-blue bg-info-blue/5">Open CORS</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* API Endpoints List */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {endpoints.map((endpoint, i) => (
            <EndpointCard key={i} endpoint={endpoint} />
          ))}
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border bg-muted/20">
              <CardTitle className="text-base font-bold uppercase tracking-wider text-foreground">Authentication</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4 pt-4 leading-relaxed">
              <p>
                Currently, all prototype APIs operate in <span className="font-semibold text-foreground">Open Mode</span> for SIH 2026 integration testing.
              </p>
              <div className="bg-muted p-3 rounded-md border border-border">
                <code className="no-translate font-mono text-xs text-foreground block mb-2">Authorization: Bearer &lt;YOUR_API_KEY&gt;</code>
                <span className="text-xs text-muted-foreground">Will be strictly enforced in production.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
