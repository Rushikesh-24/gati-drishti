"use client"

import * as React from "react"
import { Search, TrainFront, Loader2, X, BrainCircuit, Activity, History, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/use-debounce"
import { useLiveStatus } from "@/hooks/use-live-status"
import type { Train } from "@/types/train"
import { TrainOverview } from "./train-overview"
import { LiveStatusCard } from "./live-status-card"
import { AnalysisSequence } from "@/components/ai/analysis-sequence"
import { PredictionPanel } from "@/components/ai/prediction-panel"
import { HistoricalPanel } from "./historical-panel"
import { calculatePrediction } from "@/lib/ai/prediction"
import type { PredictionResult } from "@/types/prediction"
import { cn } from "@/lib/utils"

type TabView = "live" | "historical";

export function TrainSearch() {
  const [query, setQuery] = React.useState("")
  const debouncedQuery = useDebounce(query, 500)

  const [results, setResults] = React.useState<Train[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [selectedTrain, setSelectedTrain] = React.useState<Train | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)

  // Tab State
  const [activeTab, setActiveTab] = React.useState<TabView>("live")

  // AI Prediction State
  const [aiState, setAiState] = React.useState<"idle" | "analyzing" | "complete">("idle")
  const [prediction, setPrediction] = React.useState<PredictionResult | null>(null)

  // Ref for smooth scrolling
  const dashboardRef = React.useRef<HTMLDivElement>(null);

  // Polling hook for live status
  const { data: liveStatus, isLoading: isLiveLoading } = useLiveStatus(
    selectedTrain ? selectedTrain.number : null,
    15000
  )

  React.useEffect(() => {
    async function searchTrains() {
      if (debouncedQuery.trim().length < 3) {
        setResults([])
        setIsDropdownOpen(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/trains/search?q=${encodeURIComponent(debouncedQuery)}`)
        const data = await res.json()

        if (!data.success) {
          throw new Error(data.error || "Failed to search trains")
        }

        setResults(data.data)
        setIsDropdownOpen(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    if (!selectedTrain || selectedTrain.number !== debouncedQuery) {
      searchTrains()
    }
  }, [debouncedQuery, selectedTrain])

  // Scroll into view when train is selected
  React.useEffect(() => {
    if (selectedTrain && dashboardRef.current) {
      setTimeout(() => {
        dashboardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100); // small delay to ensure rendering is complete
    }
  }, [selectedTrain])

  const handleSelectTrain = (train: Train) => {
    setSelectedTrain(train)
    setQuery(train.number)
    setIsDropdownOpen(false)
    setAiState("idle")
    setPrediction(null)
    setActiveTab("live")
  }

  const handleClear = () => {
    setQuery("")
    setSelectedTrain(null)
    setResults([])
    setIsDropdownOpen(false)
    setError(null)
    setAiState("idle")
    setPrediction(null)
    setActiveTab("live")
  }

  const handleRunAI = () => {
    if (!liveStatus) return;
    setAiState("analyzing");
  }

  const handleAIComplete = () => {
    if (liveStatus) {
      setPrediction(calculatePrediction(liveStatus));
      setAiState("complete");
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 relative">
      {/* Search Input */}
      <div className="flex flex-col sm:flex-row gap-3 p-2 bg-card rounded-lg border border-border shadow-sm focus-within:ring-2 focus-within:ring-railway-green/20 transition-all">
        <div className="relative flex-1 flex items-center">
          <TrainFront className="absolute left-3 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (selectedTrain) {
                setSelectedTrain(null)
                setAiState("idle")
                setPrediction(null)
                setActiveTab("live")
              }
            }}
            onFocus={() => {
              if (results.length > 0) setIsDropdownOpen(true)
            }}
            placeholder="Search train number or train name (e.g., 12951)"
            className="w-full h-12 pl-10 pr-10 bg-transparent border-none focus:outline-none text-sm text-foreground"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button
          variant="railway"
          size="lg"
          className="h-12 w-full sm:w-auto px-8 shrink-0"
          disabled={isLoading || query.length < 3}
          onClick={() => {
            if (!isDropdownOpen && results.length > 0) {
              setIsDropdownOpen(true)
            }
          }}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Search className="w-4 h-4 mr-2" />
          )}
          Track Train
        </Button>
      </div>

      {/* Dropdown Results */}
      {isDropdownOpen && query.length >= 3 && !selectedTrain && (
        <div className="absolute top-18 left-0 right-0 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-railway-green" />
              <span>Querying Railway Systems...</span>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-sm text-alert-red bg-alert-red/5 flex flex-col items-center gap-2">
              <AlertTriangle className="w-8 h-8 opacity-80" />
              <span className="font-medium">{error}</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
              <TrainFront className="w-10 h-10 opacity-20" />
              <span>No active trains found for "{query}"</span>
            </div>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {results.map((train) => (
                <li key={train.id}>
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-muted flex flex-col gap-1 border-b border-border last:border-0 transition-colors"
                    onClick={() => handleSelectTrain(train)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        {train.number} - {train.name}
                      </span>
                      {train.isDemo && (
                        <span className="text-[10px] bg-alert-orange/10 text-alert-orange px-2 py-0.5 rounded-full font-medium">
                          Demo
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {train.origin} ({train.originCode}) → {train.destination} ({train.destinationCode})
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Selected Train Dashboard */}
      {selectedTrain && (
        <div ref={dashboardRef} className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-4 duration-500 pb-12 scroll-mt-24">
          <TrainOverview train={selectedTrain} />

          {/* Tab Navigation */}
          <div className="flex items-center bg-muted/40 p-1 rounded-lg w-full md:w-fit mt-4 border border-border">
            <button
              onClick={() => setActiveTab("live")}
              className={cn(
                "flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-md transition-all duration-300",
                activeTab === "live" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Activity className="w-4 h-4" /> Live Tracking & AI
            </button>
            <button
              onClick={() => setActiveTab("historical")}
              className={cn(
                "flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-md transition-all duration-300",
                activeTab === "historical" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <History className="w-4 h-4" /> Historical Intelligence
            </button>
          </div>

          <div className="mt-2 min-h-100">
            {activeTab === "live" && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-500">
                {liveStatus && (
                  <LiveStatusCard status={liveStatus} isLoading={isLiveLoading} />
                )}

                {/* AI CTA */}
                {liveStatus && aiState === "idle" && (
                  <div className="mt-6 flex justify-center animate-in fade-in zoom-in-95">
                    <Button
                      onClick={handleRunAI}
                      size="lg"
                      className="bg-info-blue hover:bg-info-blue/90 text-white shadow-lg shadow-info-blue/20 gap-2 h-14 px-8 text-lg font-bold"
                    >
                      <BrainCircuit className="w-6 h-6 animate-pulse" />
                      Run GATI DRISHTI AI
                    </Button>
                  </div>
                )}

                {/* AI Analysis Sequence */}
                {aiState === "analyzing" && (
                  <div className="mt-8">
                    <AnalysisSequence onComplete={handleAIComplete} />
                  </div>
                )}

                {/* AI Prediction Panel */}
                {aiState === "complete" && prediction && (
                  <PredictionPanel prediction={prediction} />
                )}
              </div>
            )}

            {activeTab === "historical" && (
              <HistoricalPanel trainNumber={selectedTrain.number} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
