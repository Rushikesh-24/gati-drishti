import * as React from "react"
import { CheckCircle2, Loader2, BrainCircuit } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = [
  "Reading live movement",
  "Comparing historical patterns",
  "Analysing route conditions",
  "Checking network congestion",
  "Estimating recovery probability",
  "Generating dynamic ETA"
];

interface AnalysisSequenceProps {
  onComplete: () => void;
}

export function AnalysisSequence({ onComplete }: AnalysisSequenceProps) {
  const [currentStep, setCurrentStep] = React.useState(0);

  React.useEffect(() => {
    if (currentStep >= STEPS.length) {
      const timer = setTimeout(() => {
        onComplete();
      }, 800);
      return () => clearTimeout(timer);
    }

    const delay = currentStep === 0 ? 500 : 600 + Math.random() * 400;
    const timer = setTimeout(() => {
      setCurrentStep(s => s + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-6 animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute -inset-4 bg-railway-green/20 blur-xl rounded-full animate-pulse" />
        <div className="w-16 h-16 bg-card border-2 border-railway-green rounded-2xl flex items-center justify-center relative z-10 shadow-lg">
          <BrainCircuit className="w-8 h-8 text-railway-green animate-pulse" />
        </div>
      </div>
      
      <h3 className="text-xl font-bold tracking-tight text-foreground">
        GATI DRISHTI Engine Running
      </h3>
      
      <div className="w-full max-w-sm flex flex-col gap-3">
        {STEPS.map((step, index) => {
          const isCompleted = currentStep > index;
          const isActive = currentStep === index;
          const isPending = currentStep < index;

          return (
            <div 
              key={step} 
              className={cn(
                "flex items-center gap-3 transition-all duration-300",
                isPending ? "opacity-30 translate-y-2" : "opacity-100 translate-y-0"
              )}
            >
              <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-railway-green animate-in zoom-in" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-border" />
                )}
              </div>
              <span className={cn(
                "text-sm font-medium",
                isActive ? "text-foreground" : isCompleted ? "text-muted-foreground" : "text-muted-foreground"
              )}>
                <span className="font-mono text-xs opacity-50 mr-2">
                  0{index + 1}
                </span>
                {step}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
