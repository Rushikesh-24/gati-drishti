"use client"

import * as React from "react"
import { Languages, Check } from "lucide-react"
import { useLanguage, LANGUAGES } from "@/components/language-context"
import { Button } from "@/components/ui/button"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative no-translate z-9999" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 border border-border/50 bg-background hover:bg-muted"
      >
        <Languages className="w-4 h-4 text-foreground" />
        <span className="sr-only">Toggle language</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 max-h-75 overflow-y-auto bg-white border border-border rounded-md shadow-xl z-9999 py-1 ring-1 ring-black/5">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              onClick={() => {
                setLanguage(lang.value)
                setIsOpen(false)
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted text-left transition-colors"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">{lang.label}</span>
              </div>
              {language.value === lang.value && (
                <Check className="w-4 h-4 text-railway-green" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
