import { createClient } from '@/lib/supabase/server'
import type { SearchRecipeResult } from '@/types/recipe'
import type { SearchIngredientResult } from '@/types/ingredient'

export async function searchRecipes(
  query: string,
  limit = 20,
  offset = 0
): Promise<SearchRecipeResult[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('search_recipes', {
    query,
    result_limit: limit,
    result_offset: offset,
  })

  if (error || !data) return []
  return data as SearchRecipeResult[]
}

export async function searchIngredients(
  query: string,
  limit = 10
): Promise<SearchIngredientResult[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('search_ingredients', {
    query,
    result_limit: limit,
  })

  if (error || !data) return []
  return data as SearchIngredientResult[]
}
