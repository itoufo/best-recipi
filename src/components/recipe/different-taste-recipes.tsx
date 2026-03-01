import { createClient } from '@/lib/supabase/server'
import { RecipeCard } from './recipe-card'
import type { RecipeCardData, RecipeTag } from '@/types/recipe'

interface DifferentTasteRecipesProps {
  currentRecipeId: number
  tags: RecipeTag[]
  course: string | null
}

export async function DifferentTasteRecipes({ currentRecipeId, tags, course }: DifferentTasteRecipesProps) {
  // Get non-taste tag IDs from this recipe (method, scene, texture)
  const nonTasteTags = tags
    .filter((t) => t.category_slug && t.category_slug !== 'taste')
    .map((t) => t.id)

  if (nonTasteTags.length === 0) return null

  const supabase = await createClient()
  const { data } = await supabase.rpc('get_recipes_by_tags', {
    tag_ids: nonTasteTags,
    exclude_recipe_id: currentRecipeId,
    result_limit: 4,
  })

  if (!data || (data as unknown[]).length === 0) return null

  const recipes: RecipeCardData[] = (data as unknown as Record<string, unknown>[]).map((r) => ({
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
  }))

  return (
    <section className="mt-12">
      <h2 className="font-serif text-2xl font-bold mb-6">同じ料理、違う味わい</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} variant="grid" />
        ))}
      </div>
    </section>
  )
}
