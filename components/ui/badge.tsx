import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "destructive";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-foreground text-background hover:bg-foreground/80": variant === "default",
          "border-transparent bg-muted text-muted-foreground hover:bg-muted/80": variant === "secondary",
          "border-transparent bg-railway-green/10 text-railway-green": variant === "success",
          "border-transparent bg-alert-orange/10 text-alert-orange": variant === "warning",
          "border-transparent bg-alert-red/10 text-alert-red": variant === "destructive",
          "border-border text-foreground": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
