import { createClient } from '@/lib/supabase/server'
import type { Ingredient } from '@/types/ingredient'

export async function getIngredientBySlug(slug: string): Promise<Ingredient | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return data as Ingredient
}

export async function getAllIngredients(options: {
  category?: string
  nicheOnly?: boolean
  limit?: number
  offset?: number
} = {}): Promise<Ingredient[]> {
  const { category, nicheOnly = false, limit = 100, offset = 0 } = options
  const supabase = await createClient()

  let query = supabase
    .from('ingredients')
    .select('*')
    .order('name')
    .range(offset, offset + limit - 1)

  if (category) query = query.eq('category', category)
  if (nicheOnly) query = query.eq('is_niche', true)

  const { data, error } = await query

  if (error || !data) return []
  return data as Ingredient[]
}

export async function getIngredientCategories(): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ingredients')
    .select('category')
    .not('category', 'is', null)
    .order('category')

  if (error || !data) return []
  const categories = [...new Set(data.map((d) => d.category as string))]
  return categories
}

export async function getIngredientSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_all_ingredient_slugs')
  if (error || !data) return []
  return data
}
