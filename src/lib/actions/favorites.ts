'use server'

import { createAuthClient } from '@/lib/supabase/server-auth'

export async function getFavorites() {
  const supabase = await createAuthClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('user_favorites')
    .select('recipe_id')
    .eq('user_id', user.id)

  return data?.map((f: { recipe_id: number }) => f.recipe_id) ?? []
}

export async function toggleFavorite(recipeId: number) {
  const supabase = await createAuthClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Check if exists
  const { data: existing } = await supabase
    .from('user_favorites')
    .select('recipe_id')
    .eq('user_id', user.id)
    .eq('recipe_id', recipeId)
    .single()

  if (existing) {
    await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('recipe_id', recipeId)
    return { favorited: false }
  } else {
    await supabase
      .from('user_favorites')
      .insert({ user_id: user.id, recipe_id: recipeId })
    return { favorited: true }
  }
}
