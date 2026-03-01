import type { Recipe } from '@/types/recipe'
import { formatNutrient } from '@/lib/utils/format'

interface NutritionTableProps {
  recipe: Recipe
}

export function NutritionTable({ recipe }: NutritionTableProps) {
  const hasNutrition = recipe.calories || recipe.protein_g || recipe.fat_g || recipe.carbs_g

  if (!hasNutrition) return null

  const items = [
    { label: 'カロリー', value: formatNutrient(recipe.calories, 'kcal') },
    { label: 'たんぱく質', value: formatNutrient(recipe.protein_g, 'g') },
    { label: '脂質', value: formatNutrient(recipe.fat_g, 'g') },
    { label: '炭水化物', value: formatNutrient(recipe.carbs_g, 'g') },
    { label: '食物繊維', value: formatNutrient(recipe.fiber_g, 'g') },
    { label: '食塩相当量', value: formatNutrient(recipe.sodium_mg, 'mg') },
  ].filter((item) => item.value !== '−')

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-serif text-lg font-bold mb-3">栄養情報</h3>
      <p className="text-xs text-muted-foreground mb-3">
        1{recipe.servings_unit}あたり
      </p>
      <dl className="divide-y divide-border">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between py-2">
            <dt className="text-sm text-muted-foreground">{item.label}</dt>
            <dd className="text-sm font-medium">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
