import Link from 'next/link'
import type { RecipeTag } from '@/types/recipe'

interface TagChipsProps {
  tags: RecipeTag[]
  grouped?: boolean
}

export function TagChips({ tags, grouped = false }: TagChipsProps) {
  if (!tags || tags.length === 0) return null

  if (!grouped) {
    return (
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <TagChip key={tag.id} tag={tag} />
        ))}
      </div>
    )
  }

  // Group tags by category
  const groups = new Map<string, RecipeTag[]>()
  for (const tag of tags) {
    const key = tag.category_name || 'その他'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(tag)
  }

  return (
    <div className="space-y-3">
      {Array.from(groups.entries()).map(([category, categoryTags]) => (
        <div key={category}>
          <span className="text-xs font-medium text-muted-foreground">{category}</span>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {categoryTags.map((tag) => (
              <TagChip key={tag.id} tag={tag} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function TagChip({ tag }: { tag: RecipeTag }) {
  return (
    <Link
      href={`/tags/${tag.slug}`}
      className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-accent hover:text-accent"
    >
      {tag.color && (
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: tag.color }}
        />
      )}
      {tag.name}
    </Link>
  )
}
