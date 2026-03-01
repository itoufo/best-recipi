import { MetadataRoute } from 'next'
import { getRecipeSlugs } from '@/lib/queries/recipes'
import { getIngredientSlugs } from '@/lib/queries/ingredients'
import { getAllTagSlugs } from '@/lib/queries/tags'
import { SITE } from '@/lib/constants/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [recipeSlugs, ingredientSlugs, tagSlugs] = await Promise.all([
    getRecipeSlugs(),
    getIngredientSlugs(),
    getAllTagSlugs(),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE.url,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE.url}/recipes`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE.url}/tags`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE.url}/ingredients`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE.url}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE.url}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${SITE.url}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.2,
    },
  ]

  const recipePages: MetadataRoute.Sitemap = recipeSlugs.map((r) => ({
    url: `${SITE.url}/recipes/${r.slug}`,
    lastModified: new Date(r.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const ingredientPages: MetadataRoute.Sitemap = ingredientSlugs.map((i) => ({
    url: `${SITE.url}/ingredients/${i.slug}`,
    lastModified: new Date(i.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const tagPages: MetadataRoute.Sitemap = tagSlugs.map((t) => ({
    url: `${SITE.url}/tags/${t.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...recipePages, ...ingredientPages, ...tagPages]
}
