"use client"

import * as React from "react"
import { 
  LayoutDashboard, 
  Activity,
  MonitorPlay,
  Code,
  Users
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import Link from "next/link"

const mainNavItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/" },
  { icon: MonitorPlay, label: "Control Room", href: "/control-room" },
  { icon: Activity, label: "Network Intelligence", href: "/network" },
  { icon: Code, label: "Developer APIs", href: "/api-portal" },
  { icon: Users, label: "The Team", href: "/team" },
]

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen border-r border-border bg-card sticky top-0">
      
      {/* Brand Header */}
      <div className="p-6 border-b border-border flex flex-col gap-1">
        <h1 className="font-bold tracking-tight text-xl text-foreground flex items-center gap-2">
          GATI DRISHTI
        </h1>
        <span className="text-xs text-muted-foreground tracking-wider">गतिदृष्टि</span>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Core Dashboard</p>
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-md text-base font-medium transition-colors relative group",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "")} />
                {item.label}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-md" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
