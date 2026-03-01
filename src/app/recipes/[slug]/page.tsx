import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getRecipeBySlug, getRecipeSlugs, getPublishedRecipes } from '@/lib/queries/recipes'
import { RecipeJsonLd } from '@/components/recipe/recipe-json-ld'
import { RecipeHero } from '@/components/recipe/recipe-hero'
import { RecipeMetaBar } from '@/components/recipe/recipe-meta-bar'
import { StepByStep } from '@/components/recipe/step-by-step'
import { IngredientSidebar } from '@/components/recipe/ingredient-sidebar'
import { NutritionTable } from '@/components/recipe/nutrition-table'
import { JumpToRecipe } from '@/components/recipe/jump-to-recipe'
import { RelatedRecipes } from '@/components/recipe/related-recipes'
import { DifferentTasteRecipes } from '@/components/recipe/different-taste-recipes'
import { TagChips } from '@/components/recipe/tag-chips'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { AdSlot } from '@/components/ads/ad-slot'
import { SITE } from '@/lib/constants/site'
import { formatDate } from '@/lib/utils/format'

export const revalidate = 3600
export const dynamicParams = true

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getRecipeSlugs()
  return slugs.slice(0, 100).map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const data = await getRecipeBySlug(slug)
  if (!data) return {}

  const { recipe, images } = data
  const heroImage = images?.find((img) => img.is_hero) || images?.[0]
  const title = recipe.meta_title || recipe.title
  const description = recipe.meta_description || recipe.description || ''

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: recipe.published_at || undefined,
      modifiedTime: recipe.updated_at,
      images: heroImage ? [{ url: heroImage.url, alt: heroImage.alt_text || recipe.title }] : [],
      url: `${SITE.url}/recipes/${recipe.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: heroImage ? [heroImage.url] : [],
    },
    alternates: {
      canonical: `${SITE.url}/recipes/${recipe.slug}`,
    },
  }
}

export default async function RecipeDetailPage({ params }: PageProps) {
  const { slug } = await params
  const data = await getRecipeBySlug(slug)

  if (!data) notFound()

  const { recipe, ingredients, images, categories, tags } = data

  const breadcrumbItems = [
    { label: 'ホーム', href: '/' },
    { label: 'レシピ', href: '/recipes' },
    ...(categories?.[0] ? [{ label: categories[0].name, href: `/categories/${categories[0].slug}` }] : []),
    { label: recipe.title },
  ]

  // Fetch related recipes (same cuisine or course)
  const related = await getPublishedRecipes({
    cuisine: recipe.cuisine || undefined,
    limit: 7,
  })
  const relatedFiltered = related.filter((r) => r.slug !== recipe.slug).slice(0, 6)

  return (
    <>
      <RecipeJsonLd recipe={data} />
      <JumpToRecipe />

      <article className="mx-auto max-w-6xl px-4 py-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* Hero */}
        <RecipeHero images={images} title={recipe.title} />

        {/* Title & Meta */}
        <div className="mt-6">
          <h1 className="font-serif text-3xl font-bold leading-tight md:text-4xl">
            {recipe.title}
          </h1>
          {recipe.description && (
            <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
              {recipe.description}
            </p>
          )}
          <div className="mt-4">
            <RecipeMetaBar
              totalTime={recipe.total_time_minutes}
              prepTime={recipe.prep_time_minutes}
              cookTime={recipe.cook_time_minutes}
              servings={recipe.servings}
              servingsUnit={recipe.servings_unit}
              difficulty={recipe.difficulty}
            />
          </div>

          {/* Tags (grouped by category) */}
          {tags && tags.length > 0 && (
            <div className="mt-4">
              <TagChips tags={tags} grouped />
            </div>
          )}

          {recipe.published_at && (
            <p className="mt-2 text-xs text-muted-foreground">
              {formatDate(recipe.published_at)}
            </p>
          )}
        </div>

        {/* Introduction */}
        {recipe.introduction && (
          <div className="mt-8 rounded-xl bg-muted/50 p-6">
            <p className="text-base leading-relaxed">{recipe.introduction}</p>
          </div>
        )}

        {/* Main Content: Steps + Sidebar */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Left: Steps */}
          <div id="recipe-steps">
            <StepByStep steps={recipe.instructions} />

            <AdSlot className="mt-8" slot="recipe-mid" />

            {/* Tips */}
            {recipe.tips && (
              <section className="mt-10">
                <h2 className="font-serif text-2xl font-bold mb-4">シェフのコツ</h2>
                <div className="rounded-xl border border-accent-secondary/20 bg-accent-secondary/5 p-6">
                  <p className="text-base leading-relaxed">{recipe.tips}</p>
                </div>
              </section>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">
            {ingredients && ingredients.length > 0 && (
              <IngredientSidebar
                ingredients={ingredients}
                defaultServings={recipe.servings}
                servingsUnit={recipe.servings_unit}
              />
            )}

            <NutritionTable recipe={recipe} />

            <AdSlot slot="recipe-sidebar" />
          </div>
        </div>

        {/* Different Taste Recipes */}
        {tags && tags.length > 0 && (
          <DifferentTasteRecipes
            currentRecipeId={recipe.id}
            tags={tags}
            course={recipe.course}
          />
        )}

        {/* Related Recipes */}
        <RelatedRecipes recipes={relatedFiltered} />

        <AdSlot className="mt-10" slot="recipe-bottom" />
      </article>
    </>
  )
}
