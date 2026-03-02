import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getCategoryBySlug } from '@/lib/queries/categories'
import { getPublishedRecipes } from '@/lib/queries/recipes'
import { InfiniteRecipeGrid } from '@/components/recipe/infinite-recipe-grid'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { SITE } from '@/lib/constants/site'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return {}

  return {
    title: `${category.name}のレシピ`,
    description: category.description || `${category.name}カテゴリのニッチ食材レシピ一覧`,
    alternates: {
      canonical: `${SITE.url}/categories/${category.slug}`,
    },
  }
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) notFound()

  const PAGE_SIZE = 12
  const recipes = await getPublishedRecipes({ course: category.name, limit: PAGE_SIZE + 1 })
  const hasMore = recipes.length > PAGE_SIZE
  const initialRecipes = hasMore ? recipes.slice(0, PAGE_SIZE) : recipes

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Breadcrumb items={[
        { label: 'ホーム', href: '/' },
        { label: 'カテゴリ', href: '/categories' },
        { label: category.name },
      ]} />

      <h1 className="font-serif text-3xl font-bold mt-4 mb-2">{category.name}</h1>
      {category.description && (
        <p className="text-muted-foreground mb-8">{category.description}</p>
      )}

      <InfiniteRecipeGrid
        initialRecipes={initialRecipes}
        initialHasMore={hasMore}
        queryParams={{ course: category.name }}
        pageSize={PAGE_SIZE}
      />
    </div>
  )
}
