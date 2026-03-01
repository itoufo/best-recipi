'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'recipi_preferences'

function readPreferences(): number[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writePreferences(ids: number[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<number[]>([])

  useEffect(() => {
    setPreferences(readPreferences())
  }, [])

  const togglePreference = useCallback((tagId: number) => {
    setPreferences((prev) => {
      const next = prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
      writePreferences(next)
      return next
    })
  }, [])

  const hasPreference = useCallback(
    (tagId: number) => preferences.includes(tagId),
    [preferences]
  )

  return { preferences, togglePreference, hasPreference }
}
