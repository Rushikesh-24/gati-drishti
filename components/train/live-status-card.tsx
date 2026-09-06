import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Map, RefreshCw } from "lucide-react"
import type { LiveStatus } from "@/types/live-status"
import { RouteVisual } from "@/components/route/route-visual"
import { T } from "@/components/i18n/t"

interface LiveStatusCardProps {
  status: LiveStatus;
  isLoading: boolean;
}

export function LiveStatusCard({ status, isLoading }: LiveStatusCardProps) {
  return (
    <Card className="mt-4 border-border shadow-md overflow-hidden bg-card animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute -inset-1 rounded-full bg-railway-green/20 animate-ping" />
            <div className="relative w-3 h-3 rounded-full bg-railway-green" />
          </div>
          <span className="font-semibold text-foreground tracking-tight uppercase"><T>Live Status</T></span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {isLoading && <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />}
          {status.isDemo ? (
            <Badge variant="warning">DEMO SIMULATION</Badge>
          ) : (
            <Badge variant="success">LIVE DATA</Badge>
          )}
        </div>
      </div>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
          
          {/* Current Station */}
          <div className="p-6 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1">
              <MapPin className="w-3 h-3" /> <T>Current / Next</T>
            </span>
            <span className="text-xl font-bold text-foreground mt-1 truncate" title={status.currentStation}>
              {status.currentStation}
            </span>
            <span className="text-sm text-muted-foreground mt-1">
              <T>Next</T>: <span className="font-medium">{status.nextStation}</span>
            </span>
          </div>

          {/* Delay */}
          <div className="p-6 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3" /> <T>Delay</T>
            </span>
            <span className="text-2xl font-bold text-alert-orange mt-1">
              +{status.delayMinutes} min
            </span>
            <span className="text-sm text-muted-foreground mt-1">
              <T>Currently running late</T>
            </span>
          </div>

          {/* Expected */}
          <div className="p-6 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3" /> <T>Expected Arrival</T>
            </span>
            <span className="text-2xl font-bold text-foreground mt-1">
              {status.expectedArrival}
            </span>
            <span className="text-sm text-muted-foreground mt-1">
              <T>At</T> {status.currentStation}
            </span>
          </div>

          {/* Progress / Updated */}
          <div className="p-6 flex flex-col gap-1 bg-muted/10">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs text-muted-foreground uppercase font-semibold"><T>Journey Progress</T></span>
              <span className="text-sm font-bold">{status.progressPercentage}%</span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div 
                className="bg-railway-green h-2 rounded-full transition-all duration-1000 ease-in-out" 
                style={{ width: `${status.progressPercentage}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
              <T>Last updated</T>: {status.lastUpdated}
            </span>
          </div>

        </div>

        {/* Route Visualizer */}
        <div className="p-6 bg-background border-t border-border">
          <div className="flex items-center gap-2 mb-4">
            <Map className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground"><T>Route Map</T></h4>
          </div>
          <RouteVisual data={{ trainNumber: status.trainNumber, stations: status.route }} />
        </div>
      </CardContent>
    </Card>
  )
}
