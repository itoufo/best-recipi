export interface UserProfile {
  id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface GuestState {
  favorites: number[]
  preferences: number[]
}
