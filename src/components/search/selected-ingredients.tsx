'use client'

interface SelectedIngredient {
  id: number
  name: string
}

interface SelectedIngredientsProps {
  ingredients: SelectedIngredient[]
  onRemove: (id: number) => void
  onClearAll: () => void
}

export function SelectedIngredients({
  ingredients,
  onRemove,
  onClearAll,
}: SelectedIngredientsProps) {
  if (ingredients.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {ingredients.map((ingredient) => (
        <span
          key={ingredient.id}
          className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent-dark"
        >
          {ingredient.name}
          <button
            type="button"
            onClick={() => onRemove(ingredient.id)}
            className="inline-flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-accent/20"
            aria-label={`${ingredient.name}を削除`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </span>
      ))}
      {ingredients.length >= 2 && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          すべてクリア
        </button>
      )}
    </div>
  )
}
