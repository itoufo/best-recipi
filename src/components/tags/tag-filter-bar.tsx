import Link from 'next/link'
import type { TagCategoryWithTags } from '@/types/tag'

interface TagFilterBarProps {
  categories: TagCategoryWithTags[]
}

export function TagFilterBar({ categories }: TagFilterBarProps) {
  if (!categories || categories.length === 0) return null

  // Show a flat horizontal scroll of tags from selected categories (taste, texture, scene)
  const displayCategories = categories.filter((c) =>
    ['taste', 'texture', 'scene'].includes(c.slug)
  )

  return (
    <div className="space-y-3">
      {displayCategories.map((cat) => (
        <div key={cat.id}>
          <span className="text-xs font-medium text-muted-foreground">{cat.name}</span>
          <div className="mt-1 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {cat.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-accent hover:text-accent"
              >
                {tag.color && (
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                )}
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
