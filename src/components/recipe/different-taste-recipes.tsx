import { createClient } from '@/lib/supabase/server'
import { RecipeCard } from './recipe-card'
import { Badge } from '@/components/ui/badge'
import type { RecipeCardData } from '@/types/recipe'

interface TasteTag {
  name: string
  slug: string
  color: string | null
}

interface VariantRow {
  id: number
  slug: string
  title: string
  description: string | null
  total_time_minutes: number | null
  servings: number
  servings_unit: string
  difficulty: string
  cuisine: string | null
  course: string | null
  hero_image_url: string | null
  hero_image_alt: string | null
  published_at: string | null
  taste_tags: TasteTag[] | null
}

interface DifferentTasteRecipesProps {
  currentRecipeId: number
  baseDish: string | null
}

export async function DifferentTasteRecipes({ currentRecipeId, baseDish }: DifferentTasteRecipesProps) {
  if (!baseDish) return null

  const supabase = await createClient()
  const { data } = await supabase.rpc('get_recipe_variants', {
    base_dish_val: baseDish,
    exclude_id: currentRecipeId,
    result_limit: 4,
  })

  if (!data || (data as unknown[]).length === 0) return null

  const variants = data as unknown as VariantRow[]

  return (
    <section className="mt-12">
      <h2 className="font-serif text-2xl font-bold mb-6">同じ料理、違う味わい</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {variants.map((variant) => {
          const card: RecipeCardData = {
            id: variant.id,
            slug: variant.slug,
            title: variant.title,
            description: variant.description,
            total_time_minutes: variant.total_time_minutes,
            servings: variant.servings,
            servings_unit: variant.servings_unit,
            difficulty: variant.difficulty as RecipeCardData['difficulty'],
            cuisine: variant.cuisine,
            course: variant.course,
            hero_image_url: variant.hero_image_url,
            hero_image_alt: variant.hero_image_alt,
            published_at: variant.published_at,
          }
          return (
            <div key={variant.id} className="space-y-2">
              <RecipeCard recipe={card} variant="grid" />
              {variant.taste_tags && variant.taste_tags.length > 0 && (
                <div className="flex flex-wrap gap-1 px-1">
                  {variant.taste_tags.map((tag) => (
                    <Badge
                      key={tag.slug}
                      variant="accent"
                      size="sm"
                      className={tag.color ? `border border-[${tag.color}]/30 bg-[${tag.color}]/10 text-[${tag.color}]` : ''}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
