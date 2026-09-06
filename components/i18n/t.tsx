"use client"

import * as React from "react"

interface TProps {
  children: string;
}

export function T({ children }: TProps) {
  return <>{children}</>;
}
