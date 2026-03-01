import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTagBySlug, getRecipesByTag, getAllTagSlugs } from '@/lib/queries/tags'
import { RecipeGrid } from '@/components/recipe/recipe-grid'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { SITE } from '@/lib/constants/site'

export const revalidate = 3600
export const dynamicParams = true

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllTagSlugs()
  return slugs.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const tag = await getTagBySlug(slug)
  if (!tag) return {}

  const title = `「${tag.name}」のレシピ一覧`
  const description = `${tag.name}のレシピを集めました。${tag.category_name ? `${tag.category_name}から探す` : ''}おいしい一皿を見つけよう。`

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE.url}/tags/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE.url}/tags/${slug}`,
    },
  }
}

export default async function TagDetailPage({ params }: PageProps) {
  const { slug } = await params
  const tag = await getTagBySlug(slug)

  if (!tag) notFound()

  const recipes = await getRecipesByTag(tag.id)

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Breadcrumb items={[
        { label: 'ホーム', href: '/' },
        { label: 'タグで探す', href: '/tags' },
        ...(tag.category_name ? [{ label: tag.category_name }] : []),
        { label: tag.name },
      ]} />

      <div className="mt-4 mb-8">
        <div className="flex items-center gap-3">
          {tag.color && (
            <span
              className="inline-block h-4 w-4 rounded-full"
              style={{ backgroundColor: tag.color }}
            />
          )}
          <h1 className="font-serif text-3xl font-bold">「{tag.name}」のレシピ</h1>
        </div>
        {tag.description && (
          <p className="mt-2 text-muted-foreground">{tag.description}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          {recipes.length}件のレシピ
        </p>
      </div>

      {recipes.length > 0 ? (
        <RecipeGrid recipes={recipes} />
      ) : (
        <p className="text-center text-muted-foreground py-12">
          このタグのレシピはまだありません
        </p>
      )}
    </div>
  )
}
