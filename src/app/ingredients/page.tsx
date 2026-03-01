import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getAllIngredients, getIngredientCategories } from '@/lib/queries/ingredients'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Badge } from '@/components/ui/badge'
import { SITE } from '@/lib/constants/site'

export const revalidate = 3600

export const metadata: Metadata = {
  title: '食材図鑑',
  description: 'サフラン、ポルチーニ、コールラビなど珍しいニッチ食材の一覧。特徴、旬、保存方法、おすすめレシピをまとめた食材図鑑。',
  alternates: {
    canonical: `${SITE.url}/ingredients`,
  },
}

interface PageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function IngredientsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const [ingredients, categories] = await Promise.all([
    getAllIngredients({ category: params.category }),
    getIngredientCategories(),
  ])

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Breadcrumb items={[
        { label: 'ホーム', href: '/' },
        { label: '食材図鑑' },
      ]} />

      <h1 className="font-serif text-3xl font-bold mt-4 mb-2">食材図鑑</h1>
      <p className="text-muted-foreground mb-8">
        珍しいニッチ食材を探索しましょう。食材をクリックすると、おすすめレシピが見つかります。
      </p>

      {/* Category Filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        <a
          href="/ingredients"
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !params.category
              ? 'bg-accent-secondary text-white'
              : 'border border-border text-muted-foreground hover:bg-muted'
          }`}
        >
          すべて
        </a>
        {categories.map((cat) => (
          <a
            key={cat}
            href={`/ingredients?category=${encodeURIComponent(cat)}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              params.category === cat
                ? 'bg-accent-secondary text-white'
                : 'border border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            {cat}
          </a>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {ingredients.map((ingredient) => (
          <Link
            key={ingredient.id}
            href={`/ingredients/${ingredient.slug}`}
            className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg"
          >
            <div className="relative aspect-square overflow-hidden">
              {ingredient.image_url ? (
                <Image
                  src={ingredient.image_url}
                  alt={ingredient.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 bg-muted flex items-center justify-center">
                  <span className="text-4xl text-muted-foreground/20">🌿</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-medium text-sm group-hover:text-accent transition-colors">
                {ingredient.name}
              </h3>
              {ingredient.category && (
                <Badge variant="secondary" size="sm" className="mt-1">
                  {ingredient.category}
                </Badge>
              )}
              {ingredient.season && (
                <p className="mt-1 text-xs text-muted-foreground">
                  旬: {ingredient.season}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {ingredients.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg text-muted-foreground">食材が見つかりませんでした</p>
        </div>
      )}
    </div>
  )
}
