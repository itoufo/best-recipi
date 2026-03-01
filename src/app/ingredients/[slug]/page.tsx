import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getIngredientBySlug, getIngredientSlugs } from '@/lib/queries/ingredients'
import { getRecipesByIngredient } from '@/lib/queries/recipes'
import { RecipeGrid } from '@/components/recipe/recipe-grid'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Badge } from '@/components/ui/badge'
import { AffiliateLink } from '@/components/ads/affiliate-link'
import { SITE } from '@/lib/constants/site'

export const revalidate = 3600
export const dynamicParams = true

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getIngredientSlugs()
  return slugs.slice(0, 100).map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const ingredient = await getIngredientBySlug(slug)
  if (!ingredient) return {}

  const title = ingredient.meta_title || `${ingredient.name}のレシピ・使い方`
  const description = ingredient.meta_description || `${ingredient.name}の特徴、旬、保存方法、おすすめレシピをご紹介。${ingredient.description || ''}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ingredient.image_url ? [{ url: ingredient.image_url }] : [],
      url: `${SITE.url}/ingredients/${ingredient.slug}`,
    },
    alternates: {
      canonical: `${SITE.url}/ingredients/${ingredient.slug}`,
    },
  }
}

export default async function IngredientDetailPage({ params }: PageProps) {
  const { slug } = await params
  const ingredient = await getIngredientBySlug(slug)

  if (!ingredient) notFound()

  const recipes = await getRecipesByIngredient(ingredient.id, 12)

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Breadcrumb items={[
        { label: 'ホーム', href: '/' },
        { label: '食材図鑑', href: '/ingredients' },
        { label: ingredient.name },
      ]} />

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* Main Content */}
        <div>
          <div className="flex items-start gap-6">
            {ingredient.image_url && (
              <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-2xl">
                <Image
                  src={ingredient.image_url}
                  alt={ingredient.name}
                  fill
                  className="object-cover"
                  sizes="128px"
                  priority
                />
              </div>
            )}
            <div>
              <h1 className="font-serif text-3xl font-bold">{ingredient.name}</h1>
              {ingredient.name_en && (
                <p className="mt-1 text-sm text-muted-foreground">{ingredient.name_en}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {ingredient.category && (
                  <Badge variant="secondary">{ingredient.category}</Badge>
                )}
                {ingredient.is_niche && (
                  <Badge variant="accent">ニッチ食材</Badge>
                )}
              </div>
            </div>
          </div>

          {ingredient.description && (
            <div className="mt-6">
              <p className="text-base leading-relaxed">{ingredient.description}</p>
            </div>
          )}

          {/* Details */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {ingredient.origin && (
              <InfoCard label="産地" value={ingredient.origin} />
            )}
            {ingredient.season && (
              <InfoCard label="旬の時期" value={ingredient.season} />
            )}
            {ingredient.storage_tips && (
              <InfoCard label="保存方法" value={ingredient.storage_tips} />
            )}
          </div>

          {/* Recipes using this ingredient */}
          {recipes.length > 0 && (
            <section className="mt-12">
              <h2 className="font-serif text-2xl font-bold mb-6">
                {ingredient.name}を使ったレシピ
              </h2>
              <RecipeGrid recipes={recipes} />
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <AffiliateLink name={ingredient.name} />
        </div>
      </div>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  )
}
