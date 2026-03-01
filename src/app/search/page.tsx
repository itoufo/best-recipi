import type { Metadata } from 'next'
import { searchRecipes, searchIngredients } from '@/lib/queries/search'
import { RecipeGrid } from '@/components/recipe/recipe-grid'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { SearchBar } from '@/components/search/search-bar'
import { SITE } from '@/lib/constants/site'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '検索',
  description: `${SITE.name}でレシピや食材を検索`,
  robots: { index: false },
}

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = params.q?.trim() || ''

  let recipes: Awaited<ReturnType<typeof searchRecipes>> = []
  let ingredients: Awaited<ReturnType<typeof searchIngredients>> = []

  if (query) {
    ;[recipes, ingredients] = await Promise.all([
      searchRecipes(query, 20),
      searchIngredients(query, 10),
    ])
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Breadcrumb items={[
        { label: 'ホーム', href: '/' },
        { label: '検索' },
      ]} />

      <h1 className="font-serif text-3xl font-bold mt-4 mb-6">レシピ・食材を検索</h1>

      <SearchBar defaultValue={query} />

      {query && (
        <div className="mt-8">
          <p className="text-sm text-muted-foreground mb-6">
            「{query}」の検索結果: レシピ {recipes.length}件、食材 {ingredients.length}件
          </p>

          {/* Ingredient Results */}
          {ingredients.length > 0 && (
            <section className="mb-10">
              <h2 className="font-serif text-xl font-bold mb-4">食材</h2>
              <div className="flex flex-wrap gap-3">
                {ingredients.map((ing) => (
                  <Link
                    key={ing.id}
                    href={`/ingredients/${ing.slug}`}
                    className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium hover:shadow-md transition-shadow"
                  >
                    {ing.name}
                    {ing.category && (
                      <span className="ml-2 text-xs text-muted-foreground">({ing.category})</span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Recipe Results */}
          {recipes.length > 0 && (
            <section>
              <h2 className="font-serif text-xl font-bold mb-4">レシピ</h2>
              <RecipeGrid recipes={recipes} />
            </section>
          )}

          {recipes.length === 0 && ingredients.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-lg text-muted-foreground">
                「{query}」に一致する結果が見つかりませんでした
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                別のキーワードで検索してみてください
              </p>
            </div>
          )}
        </div>
      )}

      {!query && (
        <div className="py-16 text-center">
          <p className="text-lg text-muted-foreground">
            食材名やレシピ名で検索できます
          </p>
        </div>
      )}
    </div>
  )
}
