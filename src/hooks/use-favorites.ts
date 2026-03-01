'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'recipi_favorites'

function readFavorites(): number[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeFavorites(ids: number[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>([])

  useEffect(() => {
    setFavorites(readFavorites())
  }, [])

  const toggleFavorite = useCallback((recipeId: number) => {
    setFavorites((prev) => {
      const next = prev.includes(recipeId)
        ? prev.filter((id) => id !== recipeId)
        : [...prev, recipeId]
      writeFavorites(next)
      return next
    })
  }, [])

  const isFavorite = useCallback(
    (recipeId: number) => favorites.includes(recipeId),
    [favorites]
  )

  return { favorites, toggleFavorite, isFavorite }
}
