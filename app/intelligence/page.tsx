import { Database, Search, ArrowRight, Train, Activity, MapPin, Navigation2, Clock } from "lucide-react";
import { IntelligenceClient } from "./client";

export const metadata = {
  title: "Historical Intelligence | GATI DRISHTI",
};

export default function IntelligencePage() {
  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* 1. DATA PEDIGREE BANNER */}
      <div className="w-full bg-primary/5 border-b border-primary/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/10 via-background/0 to-background/0 pointer-events-none" />
        <div className="p-6 md:p-8 lg:p-12 max-w-7xl mx-auto flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full text-xs font-bold tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                REAL DATA
              </span>
              <h1 className="text-sm font-bold tracking-[0.2em] text-muted-foreground uppercase">
                Gati Drishti
              </h1>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground mb-4">
              Historical Intelligence
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
              Powered by <span className="text-foreground font-semibold">38.4M</span> Historical Railway Events
            </p>
            <div className="flex items-center gap-4 mt-4 flex-wrap text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary/70" /> 365-day rolling dataset</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary/70" /> ~9,000 stations</span>
              <span className="flex items-center gap-1.5"><Train className="w-4 h-4 text-primary/70" /> ~9,000 trains</span>
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-5 flex flex-col gap-3 min-w-[280px]">
            <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">From History to Prediction</p>
            <div className="flex flex-col gap-1.5 text-sm">
              <div className="flex items-center gap-2 text-foreground"><Database className="w-4 h-4 text-primary" /> Historical Railway Data</div>
              <div className="w-0.5 h-3 bg-border ml-2" />
              <div className="flex items-center gap-2 text-foreground"><Activity className="w-4 h-4 text-primary" /> Train-Level Delay Patterns</div>
              <div className="w-0.5 h-3 bg-border ml-2" />
              <div className="flex items-center gap-2 text-foreground"><Navigation2 className="w-4 h-4 text-primary" /> Dynamic ETA Prediction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-8 lg:p-12">
        <IntelligenceClient />
      </div>
    </div>
  );
}
