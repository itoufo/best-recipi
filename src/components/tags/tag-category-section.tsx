import Link from 'next/link'
import type { TagCategoryWithTags } from '@/types/tag'

interface TagCategorySectionProps {
  category: TagCategoryWithTags
}

export function TagCategorySection({ category }: TagCategorySectionProps) {
  return (
    <section>
      <h2 className="font-serif text-xl font-bold mb-1">{category.name}</h2>
      {category.description && (
        <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {category.tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 transition-all hover:border-accent hover:shadow-sm"
          >
            {tag.color && (
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
            )}
            <span className="text-sm font-medium group-hover:text-accent transition-colors">
              {tag.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
