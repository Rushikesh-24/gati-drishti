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

const mobileNavItems = [
  { icon: LayoutDashboard, label: "Home", href: "/" },
  { icon: MonitorPlay, label: "Control", href: "/control-room" },
  { icon: Activity, label: "Network", href: "/network" },
  { icon: Code, label: "APIs", href: "/api-portal" },
  { icon: Users, label: "Team", href: "/team" },
]

export function MobileNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card pb-safe">
        <div className="flex justify-around items-center h-20">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full gap-2 transition-colors",
                  isActive 
                    ? "text-railway-green" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-[12px] font-semibold">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
