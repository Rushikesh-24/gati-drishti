import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, TrainFront } from "lucide-react"
import type { RouteData } from "@/lib/mock/route"

interface RouteVisualProps {
  data: RouteData;
  className?: string;
}

export function RouteVisual({ data, className }: RouteVisualProps) {
  // Calculate dynamic track progress based on the last completed/current station
  const currentIndex = data.stations.findIndex(s => s.status === "CURRENT" || s.status === "UPCOMING");
  
  let progressPercentage = 100;
  if (currentIndex !== -1) {
    if (data.stations[currentIndex].status === "CURRENT") {
      progressPercentage = (currentIndex / Math.max(1, data.stations.length - 1)) * 100;
    } else {
      progressPercentage = Math.max(0, ((currentIndex - 0.5) / Math.max(1, data.stations.length - 1)) * 100);
    }
  }

  // Ensure minimum width of 100px per station to prevent overlapping
  const dynamicMinWidth = Math.max(600, data.stations.length * 100);

  return (
    <div className={cn("w-full py-16 overflow-x-auto overflow-y-hidden hide-scrollbar", className)}>
      <div 
        className="flex items-center justify-between relative px-8 mx-auto"
        style={{ minWidth: `${dynamicMinWidth}px` }}
      >
        
        {/* Background Track Line */}
        <div className="absolute top-1/2 left-8 right-8 h-1.5 bg-border -translate-y-1/2 rounded-full" />
        
        {/* Active Track Line */}
        <div 
          className="absolute top-1/2 left-8 h-1.5 bg-railway-green -translate-y-1/2 rounded-full transition-all duration-1000 ease-in-out shadow-[0_0_8px_rgba(22,119,95,0.6)]" 
          style={{ width: `calc(${progressPercentage}% - 2rem)` }} 
        />

        {/* Animated Train traversing the track */}
        <div 
          className="absolute top-1/2 left-8 -translate-y-1/2 -ml-4 z-20 transition-all duration-1000 ease-in-out"
          style={{ left: `calc(2rem + calc(100% - 4rem) * ${progressPercentage / 100})` }}
        >
          <div className="bg-card border-2 border-railway-green text-railway-green rounded-full p-1.5 shadow-[0_0_15px_rgba(22,119,95,0.5)] animate-pulse-subtle">
            <TrainFront className="w-5 h-5" />
          </div>
        </div>

        {data.stations.map((station, idx) => {
          const isCompleted = station.status === "COMPLETED";
          const isCurrent = station.status === "CURRENT";
          const isUpcoming = station.status === "UPCOMING";

          return (
            <div key={station.id} className="relative z-10 flex flex-col items-center group cursor-default">
              
              {/* Top info (Time) */}
              <div className={cn(
                "absolute -top-14 flex flex-col items-center transition-opacity",
                isCurrent ? "opacity-100" : "opacity-70 group-hover:opacity-100"
              )}>
                <span className="text-xs font-mono font-medium">{station.scheduledArrival}</span>
                {station.delayMinutes ? (
                  <span className="text-[10px] font-bold text-alert-orange bg-alert-orange/10 px-1.5 py-0.5 rounded-sm mt-1">+{station.delayMinutes}m</span>
                ) : (
                  <span className="text-[10px] font-bold text-railway-green bg-railway-green/10 px-1.5 py-0.5 rounded-sm mt-1">On Time</span>
                )}
              </div>

              {/* Node */}
              <div className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center border-2 transition-colors",
                {
                  "bg-railway-green border-railway-green": isCompleted,
                  "bg-card border-railway-green": isCurrent,
                  "bg-card border-border": isUpcoming,
                }
              )} />

              {/* Bottom info (Station Name) */}
              <div className="absolute -bottom-12 flex flex-col items-center w-28 text-center">
                <span className={cn(
                  "text-xs font-semibold truncate w-full",
                  isCurrent ? "text-railway-green" : "text-foreground"
                )}>
                  {station.name}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">{station.code}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
