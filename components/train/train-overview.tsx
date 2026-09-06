import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Train as TrainIcon, MapPin, ArrowRight } from "lucide-react"
import { T } from "@/components/i18n/t"
import type { Train } from "@/types/train"

interface TrainOverviewProps {
  train: Train;
}

export function TrainOverview({ train }: TrainOverviewProps) {
  return (
    <Card className="mt-4 border-railway-green/20 shadow-md overflow-hidden animate-in fade-in slide-in-from-top-4">
      <CardHeader className="bg-muted/50 border-b border-border pb-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <TrainIcon className="w-5 h-5 text-railway-green" />
                {train.number} - {train.name}
              </CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              <T>Express</T> / <T>Superfast</T>
            </div>
          </div>
          {train.isDemo && (
            <Badge variant="warning" className="shrink-0">
              <T>Demo Data</T>
            </Badge>
          )}
          {!train.isDemo && (
            <Badge variant="success" className="shrink-0">
              <T>Live Data</T>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-between max-w-lg">
          {/* Origin */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider"><T>Origin</T></span>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-lg">{train.originCode}</span>
            </div>
            <span className="text-sm text-foreground/80">{train.origin}</span>
          </div>

          {/* Arrow */}
          <div className="flex-1 flex flex-col items-center px-4">
            <div className="w-full h-[2px] bg-border relative flex items-center justify-center">
              <ArrowRight className="w-4 h-4 absolute text-muted-foreground bg-card px-1 w-6" />
            </div>
          </div>

          {/* Destination */}
          <div className="flex flex-col gap-1 text-right">
            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider"><T>Destination</T></span>
            <div className="flex items-center justify-end gap-2">
              <span className="font-semibold text-lg">{train.destinationCode}</span>
              <MapPin className="w-4 h-4 text-railway-green" />
            </div>
            <span className="text-sm text-foreground/80">{train.destination}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
