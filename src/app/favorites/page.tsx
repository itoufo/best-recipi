'use client'

import { useEffect, useState } from 'react'
import { useFavorites } from '@/hooks/use-favorites'
import { createClient } from '@/lib/supabase/client'
import { RecipeGrid } from '@/components/recipe/recipe-grid'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Button } from '@/components/ui/button'
import type { RecipeCardData } from '@/types/recipe'

export default function FavoritesPage() {
  const { favorites } = useFavorites()
  const [recipes, setRecipes] = useState<RecipeCardData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (favorites.length === 0) {
      setRecipes([])
      setLoading(false)
      return
    }

    const supabase = createClient()
    supabase
      .from('recipes')
      .select(`
        id, slug, title, description,
        total_time_minutes, servings, servings_unit,
        difficulty, cuisine, course, published_at,
        recipe_images(url, alt_text, is_hero)
      `)
      .eq('status', 'published')
      .in('id', favorites)
      .then(({ data }) => {
        if (data) {
          const mapped = (data as unknown as Record<string, unknown>[]).map((r) => {
            const images = r.recipe_images as Array<Record<string, unknown>> | null
            const heroImage = images && images.length > 0
              ? images.find((img) => img.is_hero) || images[0]
              : null
            return {
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
              hero_image_url: (heroImage?.url as string) || null,
              hero_image_alt: (heroImage?.alt_text as string) || null,
              published_at: r.published_at as string | null,
            }
          })
          setRecipes(mapped)
        }
        setLoading(false)
      })
  }, [favorites])

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Breadcrumb items={[
        { label: 'ホーム', href: '/' },
        { label: 'お気に入り' },
      ]} />

      <h1 className="font-serif text-3xl font-bold mt-4 mb-8">お気に入り</h1>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">読み込み中...</div>
      ) : recipes.length > 0 ? (
        <RecipeGrid recipes={recipes} />
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">お気に入りのレシピはまだありません</p>
          <Button href="/recipes">レシピを探す</Button>
        </div>
      )}
    </div>
  )
}
