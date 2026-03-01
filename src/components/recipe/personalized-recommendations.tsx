'use client'

import { useEffect, useState } from 'react'
import { usePreferences } from '@/hooks/use-preferences'
import { RecipeCard } from './recipe-card'
import { Button } from '@/components/ui/button'
import type { RecipeCardData } from '@/types/recipe'

export function PersonalizedRecommendations() {
  const { preferences } = usePreferences()
  const [recipes, setRecipes] = useState<RecipeCardData[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (preferences.length === 0) {
      setRecipes([])
      return
    }

    setLoading(true)
    fetch(`/api/recommendations?tag_ids=${preferences.join(',')}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.recipes) {
          setRecipes(data.recipes.map((r: Record<string, unknown>) => ({
            id: r.id as number,
            slug: r.slug as string,
            title: r.title as string,
            description: r.description as string | null,
            total_time_minutes: r.total_time_minutes as number | null,
            servings: r.servings as number,
            servings_unit: r.servings_unit as string,
            difficulty: r.difficulty as RecipeCardData['difficulty'],
            cuisine: r.cuisine as string | null,
            course: r.course as string | null,
            hero_image_url: r.hero_image_url as string | null,
            hero_image_alt: r.hero_image_alt as string | null,
            published_at: r.published_at as string | null,
          })))
        }
      })
      .finally(() => setLoading(false))
  }, [preferences])

  if (preferences.length === 0 || loading) return null
  if (recipes.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold">あなたへのおすすめ</h2>
        <Button href="/settings" variant="ghost" size="sm">
          好みを変更 →
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {recipes.slice(0, 4).map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} variant="grid" />
        ))}
      </div>
    </section>
  )
}
