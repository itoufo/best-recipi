'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { RecipeCard } from './recipe-card'
import type { RecipeCardData } from '@/types/recipe'

interface InfiniteRecipeGridProps {
  initialRecipes: RecipeCardData[]
  initialHasMore: boolean
  /** Query params to pass to /api/recipes for pagination */
  queryParams: Record<string, string>
  pageSize?: number
  columns?: 2 | 3 | 4
}

const columnClasses = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

export function InfiniteRecipeGrid({
  initialRecipes,
  initialHasMore,
  queryParams,
  pageSize = 12,
  columns = 3,
}: InfiniteRecipeGridProps) {
  const [recipes, setRecipes] = useState(initialRecipes)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)

    const params = new URLSearchParams({
      ...queryParams,
      offset: String(recipes.length),
      limit: String(pageSize),
    })

    try {
      const res = await fetch(`/api/recipes?${params}`)
      const data = await res.json()
      setRecipes((prev) => [...prev, ...data.recipes])
      setHasMore(data.hasMore)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, recipes.length, queryParams, pageSize])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  if (recipes.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-muted-foreground">レシピが見つかりませんでした</p>
      </div>
    )
  }

  return (
    <div>
      <div className={`grid gap-6 ${columnClasses[columns]}`}>
        {recipes.map((recipe, index) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            variant="grid"
            priority={index < 3}
          />
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-white disabled:opacity-50"
          >
            {loading ? '読み込み中...' : 'もっと見る'}
          </button>
        </div>
      )}

      {loading && (
        <div className="mt-4 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      )}
    </div>
  )
}
