import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { FavoriteButton } from '@/components/recipe/favorite-button'
import { DIFFICULTY_LABELS } from '@/lib/constants/site'
import { minutesToJapanese } from '@/lib/utils/format'
import type { RecipeCardData } from '@/types/recipe'

interface RecipeCardProps {
  recipe: RecipeCardData
  variant?: 'featured' | 'grid' | 'compact'
  priority?: boolean
}

export function RecipeCard({ recipe, variant = 'grid', priority = false }: RecipeCardProps) {
  if (variant === 'featured') return <FeaturedCard recipe={recipe} priority={priority} />
  if (variant === 'compact') return <CompactCard recipe={recipe} />
  return <GridCard recipe={recipe} priority={priority} />
}

function FeaturedCard({ recipe, priority }: { recipe: RecipeCardData; priority: boolean }) {
  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className="group relative block aspect-[16/9] overflow-hidden rounded-2xl"
    >
      {recipe.hero_image_url ? (
        <Image
          src={recipe.hero_image_url}
          alt={recipe.hero_image_alt || recipe.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 80vw"
          priority={priority}
        />
      ) : (
        <div className="absolute inset-0 bg-muted" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="mb-2 flex gap-2">
          {recipe.cuisine && <Badge variant="accent" size="sm">{recipe.cuisine}</Badge>}
          {recipe.difficulty && (
            <Badge variant="default" size="sm">
              {DIFFICULTY_LABELS[recipe.difficulty] || recipe.difficulty}
            </Badge>
          )}
        </div>
        <h2 className="font-serif text-2xl font-bold leading-tight md:text-3xl">
          {recipe.title}
        </h2>
        {recipe.description && (
          <p className="mt-2 line-clamp-2 text-sm text-white/80">
            {recipe.description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-4 text-sm text-white/70">
          {recipe.total_time_minutes && (
            <span>{minutesToJapanese(recipe.total_time_minutes)}</span>
          )}
          <span>{recipe.servings}{recipe.servings_unit}</span>
        </div>
      </div>
    </Link>
  )
}

function GridCard({ recipe, priority }: { recipe: RecipeCardData; priority: boolean }) {
  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {recipe.hero_image_url ? (
          <Image
            src={recipe.hero_image_url}
            alt={recipe.hero_image_alt || recipe.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <span className="text-4xl text-muted-foreground/30">🍽</span>
          </div>
        )}
        <div className="absolute top-2 right-2 z-10">
          <FavoriteButton recipeId={recipe.id} size="sm" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-serif text-lg font-bold leading-snug line-clamp-2 group-hover:text-accent transition-colors">
          {recipe.title}
        </h3>
        {recipe.description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
            {recipe.description}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {recipe.total_time_minutes && (
            <Badge variant="outline" size="sm">
              {minutesToJapanese(recipe.total_time_minutes)}
            </Badge>
          )}
          <Badge variant="outline" size="sm">
            {recipe.servings}{recipe.servings_unit}
          </Badge>
          {recipe.difficulty && (
            <Badge variant="accent" size="sm">
              {DIFFICULTY_LABELS[recipe.difficulty] || recipe.difficulty}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  )
}

function CompactCard({ recipe }: { recipe: RecipeCardData }) {
  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className="group flex gap-4 rounded-lg border border-border bg-card p-3 transition-shadow hover:shadow-md"
    >
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
        {recipe.hero_image_url ? (
          <Image
            src={recipe.hero_image_url}
            alt={recipe.hero_image_alt || recipe.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <span className="text-xl text-muted-foreground/30">🍽</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-accent transition-colors">
          {recipe.title}
        </h3>
        <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
          {recipe.total_time_minutes && (
            <span>{minutesToJapanese(recipe.total_time_minutes)}</span>
          )}
          <span>{recipe.servings}{recipe.servings_unit}</span>
        </div>
      </div>
    </Link>
  )
}
