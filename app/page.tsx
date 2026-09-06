"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TrainSearch } from "@/components/train/train-search"
import { FeatureCard } from "@/components/dashboard/feature-card"
import { mockDashboardMetrics } from "@/lib/mock/dashboard"
import {
  ArrowRight,
  Map,
  Clock,
  LineChart,
  Activity,
  Train,
  ShieldCheck,
  History,
  Network
} from "lucide-react"

export default function Home() {
  const scrollToSearch = () => {
    document.getElementById("search-section")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="flex flex-col gap-12 p-6 lg:p-12 w-full max-w-7xl mx-auto">

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6 ">
        <Badge variant="success" className="animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-sm border border-railway-green/20">
          <span className="w-2 h-2 rounded-full bg-railway-green animate-pulse mr-2" />
          SYSTEM ONLINE
        </Badge>

        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-foreground max-w-3xl">
          Dynamic Railway <span className="text-railway-green">ETA Intelligence</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          GATI DRISHTI combines real-time movement data, historical patterns, and network conditions to continuously forecast train arrival times with unprecedented accuracy.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
          <Button variant="railway" size="lg" className="gap-2 text-base font-semibold" onClick={scrollToSearch}>
            Track a Train <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="lg" className="gap-2 text-base font-semibold bg-background">
            <ShieldCheck className="w-4 h-4" /> Explore AI Prediction
          </Button>
        </div>
      </section>

      {/* Train Search Section */}
      <section id="search-section" className="relative z-20 -mt-2 scroll-mt-24">
        <TrainSearch />
      </section>

      {/* Dashboard Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {[
          { label: "Active Trains", value: mockDashboardMetrics.activeTrains.toLocaleString(), icon: Train },
          { label: "Predictions Updated", value: mockDashboardMetrics.predictionsUpdated.toLocaleString(), icon: Activity },
          { label: "Network Alerts", value: mockDashboardMetrics.networkAlerts, icon: Activity },
          { label: "Prediction Confidence", value: `${mockDashboardMetrics.predictionConfidence}%`, icon: LineChart },
        ].map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-6 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <metric.icon className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">{metric.label}</span>
              </div>
              <span className="text-3xl font-bold text-foreground">{metric.value}</span>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Feature Cards */}
      <section className="grid md:grid-cols-2 gap-6 mt-8">
        <FeatureCard
          title="Live Train Tracking"
          description="High-frequency location updates integrated seamlessly with existing railway GPS networks to provide real-time positioning."
          icon={Map}
        />
        <FeatureCard
          title="Dynamic ETA"
          description="Machine learning models that adapt to current conditions, adjusting predictions based on weather, congestion, and historical performance."
          icon={Clock}
        />
        <FeatureCard
          title="Historical Intelligence"
          description="Deep analysis of past train runs to identify bottleneck patterns and systemic delays at specific junctions."
          icon={History}
        />
        <FeatureCard
          title="Network Awareness"
          description="Holistic view of the railway network predicting cascading delays before they affect downstream traffic."
          icon={Network}
        />
      </section>

    </div>
  )
}
