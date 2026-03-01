export interface Ingredient {
  id: number
  slug: string
  name: string
  name_reading: string | null
  name_en: string | null
  description: string | null
  category: string | null
  origin: string | null
  season: string | null
  storage_tips: string | null
  image_url: string | null
  meta_title: string | null
  meta_description: string | null
  is_niche: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  slug: string
  name: string
  description: string | null
  image_url: string | null
  display_order: number
}

export interface Tag {
  id: number
  slug: string
  name: string
}

export interface SearchIngredientResult {
  id: number
  slug: string
  name: string
  name_reading: string | null
  category: string | null
  image_url: string | null
  score: number
}
