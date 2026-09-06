import * as React from "react"
import { BrainCircuit, Clock, AlertTriangle, ChevronDown, Activity, Info } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { PredictionResult } from "@/types/prediction"

interface PredictionPanelProps {
  prediction: PredictionResult;
}

export function PredictionPanel({ prediction }: PredictionPanelProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <Card className="mt-6 border-info-blue/30 shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <CardHeader className="bg-info-blue/5 border-b border-info-blue/10 pb-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-info-blue" />
          <h3 className="font-bold tracking-tight text-lg">GATI DRISHTI AI</h3>
        </div>
        <Badge variant="outline" className="border-info-blue/30 text-info-blue bg-info-blue/5">
          AI SIMULATION
        </Badge>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
          
          {/* Main ETA */}
          <div className="p-6 md:col-span-1 flex flex-col gap-2 items-center justify-center text-center bg-card">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Predicted Arrival</span>
            <span className="text-4xl md:text-5xl font-black text-foreground tracking-tighter my-2">
              {prediction.predictedEta}
            </span>
            <div className="flex items-center gap-2">
              <span className={cn(
                "font-semibold text-xs md:text-sm px-2 py-1 rounded-md",
                prediction.totalDelayImpactMinutes > 0 ? "bg-alert-red/10 text-alert-red" : "bg-railway-green/10 text-railway-green"
              )}>
                {prediction.totalDelayImpactMinutes > 0 ? "+" : ""}{prediction.totalDelayImpactMinutes} min vs schedule
              </span>
            </div>
            
            <div className="w-full mt-6 bg-muted rounded-xl p-3 md:p-4 flex flex-col gap-2 md:gap-3">
              <div className="flex justify-between items-center text-xs md:text-sm">
                <span className="text-muted-foreground font-medium">Prediction Window</span>
                <span className="font-semibold">{prediction.windowStart} — {prediction.windowEnd}</span>
              </div>
              <div className="flex justify-between items-center text-xs md:text-sm">
                <span className="text-muted-foreground font-medium">Confidence</span>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-bold",
                    prediction.confidence === "High" ? "text-railway-green" : 
                    prediction.confidence === "Medium" ? "text-alert-orange" : "text-alert-red"
                  )}>
                    {prediction.confidence} ({prediction.confidencePercentage}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Factor Breakdown */}
          <div className="p-4 md:p-6 md:col-span-2 bg-card/50">
            <h4 className="text-xs md:text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Why?</h4>
            <div className="flex flex-col gap-3">
              {prediction.factors.map(factor => (
                <div key={factor.id} className="flex items-center justify-between group">
                  <span className="text-xs md:text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors pr-2">
                    {factor.name}
                  </span>
                  <div className="flex items-center gap-2 md:gap-3 shrink-0">
                    <div className="hidden sm:flex w-24 h-1.5 bg-muted rounded-full overflow-hidden justify-end">
                      {factor.impactMinutes < 0 ? (
                        <div className="bg-railway-green h-full" style={{ width: `${Math.min(100, Math.abs(factor.impactMinutes) * 10)}%` }} />
                      ) : null}
                    </div>
                    <span className={cn(
                      "text-xs md:text-sm font-bold w-10 md:w-12 text-right",
                      factor.impactMinutes > 0 ? "text-alert-red" : "text-railway-green"
                    )}>
                      {factor.impactMinutes > 0 ? "+" : ""}{factor.impactMinutes} m
                    </span>
                  </div>
                </div>
              ))}
              
              <div className="border-t border-border mt-3 pt-3 flex items-center justify-between">
                <span className="text-xs md:text-sm font-bold text-foreground">Total Predicted Impact</span>
                <span className={cn(
                  "text-sm md:text-base font-black",
                  prediction.totalDelayImpactMinutes > 0 ? "text-alert-red" : "text-railway-green"
                )}>
                  {prediction.totalDelayImpactMinutes > 0 ? "+" : ""}{prediction.totalDelayImpactMinutes} min
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Architecture Visual Accordion */}
        <div className="border-t border-border">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-4 md:px-6 py-4 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Activity className="w-4 h-4 text-info-blue" />
              How GATI DRISHTI thinks
            </div>
            <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-300", isExpanded && "rotate-180")} />
          </button>
          
          <div className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}>
            <div className="p-4 md:p-6 bg-card flex flex-col items-center justify-center">
              <div className="flex gap-4 items-start text-center mb-6 overflow-x-auto w-full max-w-full justify-start md:justify-center pb-2 hide-scrollbar">
                <ArchBox label="Live Data" />
                <span className="text-muted-foreground font-bold mt-2">+</span>
                <ArchBox label="Historical Data" />
                <span className="text-muted-foreground font-bold mt-2">+</span>
                <ArchBox label="Network Context" />
                <span className="text-muted-foreground font-bold mt-2">+</span>
                <ArchBox label="Operational Factors" />
              </div>
              
              <ArrowDown />
              <ArchBox label="Feature Engineering" wide />
              
              <ArrowDown />
              <ArchBox label="Prediction Engine" highlight wide />
              
              <div className="flex gap-4 md:gap-8 mt-6">
                <div className="flex flex-col items-center">
                  <ArrowDown />
                  <ArchBox label="Confidence Estimation" />
                </div>
                <div className="flex flex-col items-center">
                  <ArrowDown />
                  <ArchBox label="Dynamic ETA" highlight />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ArchBox({ label, highlight, wide }: { label: string, highlight?: boolean, wide?: boolean }) {
  return (
    <div className={cn(
      "border rounded-md px-3 py-2 text-xs font-semibold shadow-sm",
      highlight ? "bg-info-blue text-white border-info-blue" : "bg-background border-border text-foreground",
      wide && "w-48 text-center"
    )}>
      {label}
    </div>
  )
}

function ArrowDown() {
  return (
    <div className="h-6 w-0.5 bg-border my-1" />
  )
}
