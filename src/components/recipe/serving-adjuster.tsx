'use client'

import { useState } from 'react'

interface ServingAdjusterProps {
  defaultServings: number
  servingsUnit: string
  onServingsChange: (servings: number) => void
}

export function ServingAdjuster({
  defaultServings,
  servingsUnit,
  onServingsChange,
}: ServingAdjusterProps) {
  const [servings, setServings] = useState(defaultServings)

  const handleChange = (newServings: number) => {
    if (newServings < 1 || newServings > 20) return
    setServings(newServings)
    onServingsChange(newServings)
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => handleChange(servings - 1)}
        disabled={servings <= 1}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="人数を減らす"
      >
        −
      </button>
      <span className="min-w-[4rem] text-center font-medium">
        {servings}{servingsUnit}
      </span>
      <button
        onClick={() => handleChange(servings + 1)}
        disabled={servings >= 20}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="人数を増やす"
      >
        +
      </button>
    </div>
  )
}
