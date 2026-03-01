interface PopularIngredient {
  id: number
  name: string
}

interface PopularIngredientsProps {
  ingredients: PopularIngredient[]
  selectedIds: Set<number>
  onSelect: (ingredient: PopularIngredient) => void
}

export function PopularIngredients({
  ingredients,
  selectedIds,
  onSelect,
}: PopularIngredientsProps) {
  if (ingredients.length === 0) return null

  return (
    <div>
      <span className="text-xs font-medium text-muted-foreground">よく使われる食材</span>
      <div className="mt-1.5 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {ingredients.map((ingredient) => {
          const isSelected = selectedIds.has(ingredient.id)
          return (
            <button
              key={ingredient.id}
              type="button"
              onClick={() => !isSelected && onSelect(ingredient)}
              disabled={isSelected}
              className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                isSelected
                  ? 'border-transparent bg-accent/10 text-accent-dark/40 cursor-default'
                  : 'border-border bg-card text-muted-foreground hover:border-accent hover:text-accent cursor-pointer'
              }`}
            >
              {ingredient.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
