"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";

export function TopBar() {
  return (
    <header className="sticky top-0 z-50 w-full flex h-14 items-center justify-between border-b bg-background/95 px-4 lg:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="flex lg:hidden items-center">
        <h1 className="font-bold tracking-tight text-lg text-foreground">
          GATI DRISHTI
        </h1>
      </div>
      <div className="flex items-center gap-3 ml-auto">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
