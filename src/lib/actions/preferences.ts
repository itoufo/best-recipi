'use server'

import { createAuthClient } from '@/lib/supabase/server-auth'

export async function getPreferences() {
  const supabase = await createAuthClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('user_preferences')
    .select('tag_id')
    .eq('user_id', user.id)

  return data?.map((p: { tag_id: number }) => p.tag_id) ?? []
}

export async function setPreferences(tagIds: number[]) {
  const supabase = await createAuthClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Delete all existing preferences
  await supabase
    .from('user_preferences')
    .delete()
    .eq('user_id', user.id)

  // Insert new ones
  if (tagIds.length > 0) {
    await supabase
      .from('user_preferences')
      .insert(tagIds.map((tagId) => ({ user_id: user.id, tag_id: tagId })))
  }

  return { success: true }
}
