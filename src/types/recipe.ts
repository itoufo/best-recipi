export interface Recipe {
  id: number
  slug: string
  title: string
  description: string | null
  introduction: string | null
  prep_time_minutes: number | null
  cook_time_minutes: number | null
  total_time_minutes: number | null
  servings: number
  servings_unit: string
  difficulty: 'easy' | 'medium' | 'hard'
  calories: number | null
  protein_g: number | null
  fat_g: number | null
  carbs_g: number | null
  fiber_g: number | null
  sodium_mg: number | null
  instructions: RecipeStep[]
  meta_title: string | null
  meta_description: string | null
  keywords: string[]
  cuisine: string | null
  course: string | null
  tips: string | null
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  featured: boolean
  created_at: string
  updated_at: string
}

export interface RecipeStep {
  step: number
  text: string
  image_url: string | null
  tip: string | null
}

export interface RecipeIngredientEntry {
  id: number
  quantity: string | null
  unit: string | null
  preparation: string | null
  is_optional: boolean
  display_order: number
  group_name: string | null
  ingredient: {
    id: number
    slug: string
    name: string
    name_en: string | null
  }
}

export interface RecipeImage {
  id: number
  url: string
  alt_text: string | null
  is_hero: boolean
}

export interface RecipeCategory {
  id: number
  slug: string
  name: string
}

export interface RecipeTag {
  id: number
  slug: string
  name: string
  category_slug: string | null
  category_name: string | null
  color: string | null
}

export interface RecipeDetail {
  recipe: Recipe
  ingredients: RecipeIngredientEntry[] | null
  images: RecipeImage[] | null
  categories: RecipeCategory[] | null
  tags: RecipeTag[] | null
}

export interface RecipeCardData {
  id: number
  slug: string
  title: string
  description: string | null
  total_time_minutes: number | null
  servings: number
  servings_unit: string
  difficulty: 'easy' | 'medium' | 'hard'
  cuisine: string | null
  course: string | null
  hero_image_url: string | null
  hero_image_alt: string | null
  published_at: string | null
}

export interface SearchRecipeResult extends RecipeCardData {
  score: number
}

export interface CombinationSearchResult extends RecipeCardData {
  match_count: number
  total_ingredients: number
}
