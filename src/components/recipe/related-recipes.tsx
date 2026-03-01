import { RecipeCard } from './recipe-card'
import type { RecipeCardData } from '@/types/recipe'

interface RelatedRecipesProps {
  recipes: RecipeCardData[]
  title?: string
}

export function RelatedRecipes({ recipes, title = '関連レシピ' }: RelatedRecipesProps) {
  if (!recipes || recipes.length === 0) return null

  return (
    <section className="mt-12">
      <h2 className="font-serif text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.slice(0, 6).map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} variant="grid" />
        ))}
      </div>
    </section>
  )
}
