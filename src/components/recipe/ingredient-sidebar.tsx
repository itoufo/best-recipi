'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ServingAdjuster } from './serving-adjuster'
import { adjustQuantity } from '@/lib/utils/servings'
import type { RecipeIngredientEntry } from '@/types/recipe'

interface IngredientSidebarProps {
  ingredients: RecipeIngredientEntry[]
  defaultServings: number
  servingsUnit: string
}

export function IngredientSidebar({
  ingredients,
  defaultServings,
  servingsUnit,
}: IngredientSidebarProps) {
  const [targetServings, setTargetServings] = useState(defaultServings)

  // Group ingredients
  const groups = groupIngredients(ingredients)

  return (
    <aside className="rounded-xl border border-border bg-card p-5 lg:sticky lg:top-20">
      <h2 className="font-serif text-xl font-bold mb-4">材料</h2>

      <ServingAdjuster
        defaultServings={defaultServings}
        servingsUnit={servingsUnit}
        onServingsChange={setTargetServings}
      />

      <div className="mt-5 space-y-5">
        {groups.map((group) => (
          <div key={group.name || '__main__'}>
            {group.name && (
              <h3 className="text-sm font-semibold text-accent-secondary mb-2">
                {group.name}
              </h3>
            )}
            <ul className="divide-y divide-border">
              {group.items.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/ingredients/${entry.ingredient.slug}`}
                      className="text-sm font-medium hover:text-accent transition-colors"
                    >
                      {entry.ingredient.name}
                    </Link>
                    {entry.preparation && (
                      <span className="text-xs text-muted-foreground">
                        ({entry.preparation})
                      </span>
                    )}
                    {entry.is_optional && (
                      <span className="text-xs text-muted-foreground/60">
                        お好みで
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap ml-3">
                    {adjustQuantity(entry.quantity, defaultServings, targetServings)}
                    {entry.unit && ` ${entry.unit}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  )
}

interface IngredientGroup {
  name: string | null
  items: RecipeIngredientEntry[]
}

function groupIngredients(ingredients: RecipeIngredientEntry[]): IngredientGroup[] {
  const map = new Map<string | null, RecipeIngredientEntry[]>()

  for (const entry of ingredients) {
    const key = entry.group_name
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(entry)
  }

  const groups: IngredientGroup[] = []
  // Main group first (null group_name)
  if (map.has(null)) {
    groups.push({ name: null, items: map.get(null)! })
    map.delete(null)
  }
  // Named groups
  for (const [name, items] of map) {
    groups.push({ name, items })
  }

  return groups
}
