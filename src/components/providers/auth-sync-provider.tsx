'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { useAuth } from './auth-provider'
import { createClient } from '@/lib/supabase/client'

const FAVORITES_KEY = 'recipi_favorites'
const PREFERENCES_KEY = 'recipi_preferences'

export function AuthSyncProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const syncedRef = useRef(false)

  useEffect(() => {
    if (!user || syncedRef.current) return
    syncedRef.current = true

    const guestFavorites = readLocalStorage(FAVORITES_KEY)
    const guestPreferences = readLocalStorage(PREFERENCES_KEY)

    const supabase = createClient()

    // Sync guest favorites to DB
    if (guestFavorites.length > 0) {
      supabase.rpc('sync_guest_favorites', {
        p_user_id: user.id,
        p_recipe_ids: guestFavorites,
      }).then(() => {
        localStorage.removeItem(FAVORITES_KEY)
      })
    }

    // Sync guest preferences to DB
    if (guestPreferences.length > 0) {
      supabase.rpc('sync_guest_preferences', {
        p_user_id: user.id,
        p_tag_ids: guestPreferences,
      }).then(() => {
        localStorage.removeItem(PREFERENCES_KEY)
      })
    }
  }, [user])

  return <>{children}</>
}

function readLocalStorage(key: string): number[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
