import type { Metadata } from 'next'
import { getPublishedRecipes } from '@/lib/queries/recipes'
import { getAllTagsGrouped } from '@/lib/queries/tags'
import { RecipeGrid } from '@/components/recipe/recipe-grid'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { SITE } from '@/lib/constants/site'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'レシピ一覧',
  description: `${SITE.name}のレシピ一覧。味・食感・シーンで探せるレシピを多数掲載。`,
  alternates: {
    canonical: `${SITE.url}/recipes`,
  },
}

interface PageProps {
  searchParams: Promise<{
    cuisine?: string
    course?: string
    difficulty?: string
    tag?: string
    page?: string
  }>
}

export default async function RecipesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  const limit = 24
  const offset = (page - 1) * limit

  const [recipes, tagCategories] = await Promise.all([
    getPublishedRecipes({
      limit: limit + 1,
      offset,
      cuisine: params.cuisine,
      course: params.course,
      difficulty: params.difficulty,
      tagSlug: params.tag,
    }),
    getAllTagsGrouped(),
  ])

  const hasNextPage = recipes.length > limit
  const displayRecipes = recipes.slice(0, limit)

  // Build pagination query params
  const filterParams = new URLSearchParams()
  if (params.cuisine) filterParams.set('cuisine', params.cuisine)
  if (params.tag) filterParams.set('tag', params.tag)
  const filterString = filterParams.toString()

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Breadcrumb items={[
        { label: 'ホーム', href: '/' },
        { label: 'レシピ一覧' },
      ]} />

      <h1 className="font-serif text-3xl font-bold mt-4 mb-8">レシピ一覧</h1>

      {/* Cuisine Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <FilterLink label="すべて" href="/recipes" active={!params.cuisine && !params.course && !params.tag} />
        <FilterLink label="和食" href="/recipes?cuisine=和食" active={params.cuisine === '和食'} />
        <FilterLink label="イタリアン" href="/recipes?cuisine=イタリアン" active={params.cuisine === 'イタリアン'} />
        <FilterLink label="フレンチ" href="/recipes?cuisine=フレンチ" active={params.cuisine === 'フレンチ'} />
        <FilterLink label="中華" href="/recipes?cuisine=中華" active={params.cuisine === '中華'} />
      </div>

      {/* Tag Filters */}
      {tagCategories.length > 0 && (
        <div className="mb-8 space-y-2">
          {tagCategories.filter((c) => ['taste', 'scene', 'method'].includes(c.slug)).map((cat) => (
            <div key={cat.id} className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="shrink-0 text-xs font-medium text-muted-foreground w-16">{cat.name}</span>
              <div className="flex gap-1.5">
                {cat.tags.map((tag) => (
                  <FilterLink
                    key={tag.id}
                    label={tag.name}
                    href={`/recipes?tag=${tag.slug}`}
                    active={params.tag === tag.slug}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <RecipeGrid recipes={displayRecipes} />

      {/* Pagination */}
      <div className="mt-12 flex justify-center gap-4">
        {page > 1 && (
          <a
            href={`/recipes?page=${page - 1}${filterString ? `&${filterString}` : ''}`}
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            前のページ
          </a>
        )}
        {hasNextPage && (
          <a
            href={`/recipes?page=${page + 1}${filterString ? `&${filterString}` : ''}`}
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-dark transition-colors"
          >
            次のページ
          </a>
        )}
      </div>
    </div>
  )
}

function FilterLink({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <a
      href={href}
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? 'bg-accent text-white'
          : 'border border-border text-muted-foreground hover:bg-muted'
      }`}
    >
      {label}
    </a>
  )
}
