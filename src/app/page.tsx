import Link from 'next/link'
import { getFeaturedRecipes, getPublishedRecipes } from '@/lib/queries/recipes'
import { getAllCategories } from '@/lib/queries/categories'
import { getAllTagsGrouped } from '@/lib/queries/tags'
import { RecipeCard } from '@/components/recipe/recipe-card'
import { RecipeGrid } from '@/components/recipe/recipe-grid'
import { Button } from '@/components/ui/button'
import { TagFilterBar } from '@/components/tags/tag-filter-bar'
import { PersonalizedRecommendations } from '@/components/recipe/personalized-recommendations'
import { SITE } from '@/lib/constants/site'

export const revalidate = 3600

export default async function HomePage() {
  const [featured, latest, categories, tagCategories] = await Promise.all([
    getFeaturedRecipes(4),
    getPublishedRecipes({ limit: 8 }),
    getAllCategories(),
    getAllTagsGrouped(),
  ])

  const heroRecipe = featured[0]
  const otherFeatured = featured.slice(1)

  return (
    <div>
      {/* Hero Section */}
      {heroRecipe && (
        <section className="mx-auto max-w-6xl px-4 pt-8 pb-4">
          <RecipeCard recipe={heroRecipe} variant="featured" priority />
        </section>
      )}

      {/* Personalized Recommendations (client component, shows only when preferences set) */}
      <PersonalizedRecommendations />

      {/* Tag Browsing Bar */}
      {tagCategories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-2xl font-bold">タグで探す</h2>
            <Button href="/tags" variant="ghost" size="sm">
              すべて見る →
            </Button>
          </div>
          <TagFilterBar categories={tagCategories} />
        </section>
      )}

      {/* Featured Recipes */}
      {otherFeatured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold">注目レシピ</h2>
            <Button href="/recipes" variant="ghost" size="sm">
              すべて見る →
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {otherFeatured.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} variant="grid" />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <h2 className="font-serif text-2xl font-bold mb-6">カテゴリから探す</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group overflow-hidden rounded-xl border border-border bg-card px-6 py-4 transition-shadow hover:shadow-md"
              >
                <span className="font-medium text-sm group-hover:text-accent transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest Recipes */}
      {latest.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold">最新レシピ</h2>
            <Button href="/recipes" variant="ghost" size="sm">
              すべて見る →
            </Button>
          </div>
          <RecipeGrid recipes={latest} />
        </section>
      )}

      {/* Ingredient Search CTA */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="font-serif text-2xl font-bold mb-2">食材の組み合わせで探す</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            冷蔵庫にある食材を入力して、今すぐ作れるレシピを見つけましょう
          </p>
          <Button href="/search/ingredients" size="lg">
            食材で探す
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h2 className="font-serif text-3xl font-bold mb-4">{SITE.tagline}</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          {SITE.description}
        </p>
        <div className="flex justify-center gap-4">
          <Button href="/recipes" size="lg">
            レシピを探す
          </Button>
          <Button href="/tags" variant="outline" size="lg">
            タグで探す
          </Button>
        </div>
      </section>
    </div>
  )
}
