import { RecipeCard } from './recipe-card'
import type { RecipeCardData } from '@/types/recipe'

interface RecipeGridProps {
  recipes: RecipeCardData[]
  variant?: 'grid' | 'compact'
  columns?: 2 | 3 | 4
}

const columnClasses = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

export function RecipeGrid({ recipes, variant = 'grid', columns = 3 }: RecipeGridProps) {
  if (recipes.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-muted-foreground">レシピが見つかりませんでした</p>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} variant="compact" />
        ))}
      </div>
    )
  }

  return (
    <div className={`grid gap-6 ${columnClasses[columns]}`}>
      {recipes.map((recipe, index) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          variant="grid"
          priority={index < 3}
        />
      ))}
    </div>
  )
}
