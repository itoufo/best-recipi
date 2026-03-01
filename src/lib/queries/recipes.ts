import { createClient } from '@/lib/supabase/server'
import type { RecipeCardData, RecipeDetail } from '@/types/recipe'

export async function getRecipeBySlug(slug: string): Promise<RecipeDetail | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_recipe_detail', {
    recipe_slug: slug,
  })
  if (error || !data) return null
  return data as unknown as RecipeDetail
}

function mapToRecipeCard(r: Record<string, unknown>): RecipeCardData {
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
}

export async function getPublishedRecipes(options: {
  limit?: number
  offset?: number
  cuisine?: string
  course?: string
  difficulty?: string
  tagSlug?: string
} = {}): Promise<RecipeCardData[]> {
  const { limit = 20, offset = 0, cuisine, course, difficulty, tagSlug } = options
  const supabase = await createClient()

  // If filtering by tag, use a different query via recipe_tags join
  if (tagSlug) {
    // First get the tag ID
    const { data: tagData } = await supabase
      .from('tags')
      .select('id')
      .eq('slug', tagSlug)
      .single()

    if (!tagData) return []

    const { data, error } = await supabase
      .from('recipe_tags')
      .select(`
        recipes!inner(
          id, slug, title, description,
          total_time_minutes, servings, servings_unit,
          difficulty, cuisine, course, published_at, status,
          recipe_images(url, alt_text, is_hero)
        )
      `)
      .eq('tag_id', (tagData as unknown as { id: number }).id)
      .range(offset, offset + limit - 1)

    if (error || !data) return []

    return (data as unknown as Array<{ recipes: Record<string, unknown> }>)
      .map((row) => mapToRecipeCard(row.recipes))
  }

  let query = supabase
    .from('recipes')
    .select(`
      id, slug, title, description,
      total_time_minutes, servings, servings_unit,
      difficulty, cuisine, course, published_at,
      recipe_images(url, alt_text, is_hero)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (cuisine) query = query.eq('cuisine', cuisine)
  if (course) query = query.eq('course', course)
  if (difficulty) query = query.eq('difficulty', difficulty)

  const { data, error } = await query

  if (error || !data) return []

  return (data as unknown as Record<string, unknown>[]).map(mapToRecipeCard)
}

export async function getFeaturedRecipes(limit = 6): Promise<RecipeCardData[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      id, slug, title, description,
      total_time_minutes, servings, servings_unit,
      difficulty, cuisine, course, published_at,
      recipe_images(url, alt_text, is_hero)
    `)
    .eq('status', 'published')
    .eq('featured', true)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []

  return (data as unknown as Record<string, unknown>[]).map(mapToRecipeCard)
}

export async function getRecipeSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_all_recipe_slugs')
  if (error || !data) return []
  return data as unknown as { slug: string; updated_at: string }[]
}

export async function getRecipesByIngredient(ingredientId: number, limit = 12): Promise<RecipeCardData[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('recipe_ingredients')
    .select(`
      recipes!inner(
        id, slug, title, description,
        total_time_minutes, servings, servings_unit,
        difficulty, cuisine, course, published_at, status,
        recipe_images(url, alt_text, is_hero)
      )
    `)
    .eq('ingredient_id', ingredientId)
    .limit(limit)

  if (error || !data) return []

  return (data as unknown as Array<{ recipes: Record<string, unknown> }>)
    .map((row) => mapToRecipeCard(row.recipes))
}
