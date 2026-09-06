"use client"

import * as React from "react"
import { AlertCircle, TrainFront, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import type { NetworkNode, NetworkEdge, NetworkTrain, CongestionLevel } from "@/lib/mock/network"

interface NetworkMapProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  trains: NetworkTrain[];
}

export function NetworkMap({ nodes, edges, trains }: NetworkMapProps) {

  const getEdgeColor = (status: CongestionLevel) => {
    switch (status) {
      case "Disruption": return "stroke-alert-red drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]";
      case "Heavy": return "stroke-alert-orange drop-shadow-[0_0_5px_rgba(249,115,22,0.6)]";
      case "Moderate": return "stroke-amber-400";
      default: return "stroke-border";
    }
  }

  const getNodeColor = (status?: CongestionLevel) => {
    switch (status) {
      case "Disruption": return "fill-alert-red stroke-alert-red/30";
      case "Heavy": return "fill-alert-orange stroke-alert-orange/30";
      case "Moderate": return "fill-amber-400 stroke-amber-400/30";
      default: return "fill-card stroke-border";
    }
  }

  return (
    <div className="relative w-full aspect-4/3 md:aspect-21/9 bg-background border border-border rounded-xl overflow-hidden shadow-inner">

      {/* Schematic SVG Map */}
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0">

        {/* Draw Edges */}
        {edges.map(edge => {
          const source = nodes.find(n => n.id === edge.source);
          const target = nodes.find(n => n.id === edge.target);
          if (!source || !target) return null;

          return (
            <line
              key={edge.id}
              x1={`${source.x}%`}
              y1={`${source.y}%`}
              x2={`${target.x}%`}
              y2={`${target.y}%`}
              strokeWidth="1.5"
              className={cn("transition-all duration-1000 ease-in-out", getEdgeColor(edge.status))}
            />
          )
        })}

        {/* Draw Nodes */}
        {nodes.map(node => {
          const isJunction = node.type === "junction";
          const hasDisruption = node.status === "Disruption";

          return (
            <g key={node.id} className="transition-all duration-1000 ease-in-out">
              {hasDisruption && (
                <circle
                  cx={`${node.x}%`}
                  cy={`${node.y}%`}
                  r="6"
                  className="fill-alert-red/20 animate-ping"
                />
              )}
              <circle
                cx={`${node.x}%`}
                cy={`${node.y}%`}
                r={isJunction ? "2" : "1.5"}
                strokeWidth={isJunction ? "1" : "0.5"}
                className={cn("transition-colors duration-1000", getNodeColor(node.status))}
              />
            </g>
          )
        })}

        {/* Draw Trains */}
        {trains.map(train => {
          const edge = edges.find(e => e.id === train.edgeId);
          if (!edge) return null;
          const source = nodes.find(n => n.id === edge.source);
          const target = nodes.find(n => n.id === edge.target);
          if (!source || !target) return null;

          // Calculate position based on progress
          const x = source.x + ((target.x - source.x) * (train.progress / 100));
          const y = source.y + ((target.y - source.y) * (train.progress / 100));

          return (
            <g key={train.id} className="transition-all duration-1000 ease-in-out">
              <circle
                cx={`${x}%`}
                cy={`${y}%`}
                r="1.5"
                className={cn(
                  "transition-colors duration-1000",
                  train.status === "delayed" ? "fill-alert-orange" :
                    train.status === "stopped" ? "fill-alert-red" : "fill-railway-green"
                )}
              />
            </g>
          )
        })}
      </svg>

      {/* HTML Overlay for Labels (so text stays unscaled) */}
      <div className="absolute inset-0 pointer-events-none">
        {nodes.map(node => (
          <div
            key={node.id}
            className="absolute -translate-x-1/2 mt-3 flex flex-col items-center"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            <span className="text-[10px] md:text-xs font-semibold text-foreground whitespace-nowrap drop-shadow-md bg-background/50 px-1 rounded">
              {node.name}
            </span>
            <span className="text-[8px] text-muted-foreground font-mono bg-background/50 px-1 rounded">{node.id}</span>
          </div>
        ))}

        {trains.map(train => {
          const edge = edges.find(e => e.id === train.edgeId);
          if (!edge) return null;
          const source = nodes.find(n => n.id === edge.source);
          const target = nodes.find(n => n.id === edge.target);
          if (!source || !target) return null;
          const x = source.x + ((target.x - source.x) * (train.progress / 100));
          const y = source.y + ((target.y - source.y) * (train.progress / 100));

          return (
            <div
              key={train.id}
              className="absolute -translate-x-1/2 -translate-y-full mb-2 flex items-center gap-1 bg-card border border-border shadow-md px-1.5 py-0.5 rounded-sm transition-all duration-1000"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <TrainFront className={cn("w-3 h-3",
                train.status === "delayed" ? "text-alert-orange" :
                  train.status === "stopped" ? "text-alert-red" : "text-railway-green"
              )} />
              <span className="text-[9px] font-bold">{train.number}</span>
              {train.delayMinutes > 0 && (
                <span className="text-[9px] font-bold text-alert-red">+{train.delayMinutes}m</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
