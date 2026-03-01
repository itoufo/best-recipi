import type { RecipeDetail } from '@/types/recipe'
import { minutesToISO8601 } from '@/lib/utils/format'
import { SITE } from '@/lib/constants/site'

interface RecipeJsonLdProps {
  recipe: RecipeDetail
}

export function RecipeJsonLd({ recipe }: RecipeJsonLdProps) {
  const { recipe: r, ingredients, images } = recipe
  const heroImage = images?.find((img) => img.is_hero) || images?.[0]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: r.title,
    description: r.description || r.introduction || '',
    image: heroImage
      ? [heroImage.url]
      : [],
    author: {
      '@type': 'Organization',
      name: SITE.author,
      url: SITE.url,
    },
    datePublished: r.published_at || r.created_at,
    dateModified: r.updated_at,
    prepTime: minutesToISO8601(r.prep_time_minutes),
    cookTime: minutesToISO8601(r.cook_time_minutes),
    totalTime: minutesToISO8601(r.total_time_minutes),
    recipeYield: `${r.servings}${r.servings_unit}`,
    recipeCategory: r.course || undefined,
    recipeCuisine: r.cuisine || undefined,
    keywords: r.keywords?.join(', ') || undefined,
    recipeIngredient: ingredients?.map((entry) => {
      const parts = [
        entry.quantity,
        entry.unit,
        entry.ingredient.name,
        entry.preparation ? `(${entry.preparation})` : null,
      ].filter(Boolean)
      return parts.join(' ')
    }) || [],
    recipeInstructions: r.instructions?.map((step) => ({
      '@type': 'HowToStep',
      position: step.step,
      text: step.text,
      ...(step.image_url ? { image: step.image_url } : {}),
      ...(step.tip ? { tip: step.tip } : {}),
    })) || [],
    ...(r.calories ? {
      nutrition: {
        '@type': 'NutritionInformation',
        calories: `${r.calories} cal`,
        ...(r.protein_g ? { proteinContent: `${r.protein_g} g` } : {}),
        ...(r.fat_g ? { fatContent: `${r.fat_g} g` } : {}),
        ...(r.carbs_g ? { carbohydrateContent: `${r.carbs_g} g` } : {}),
        ...(r.fiber_g ? { fiberContent: `${r.fiber_g} g` } : {}),
        ...(r.sodium_mg ? { sodiumContent: `${r.sodium_mg} mg` } : {}),
      },
    } : {}),
    url: `${SITE.url}/recipes/${r.slug}`,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
