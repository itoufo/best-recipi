import { createClient } from '@/lib/supabase/server'
import type { TagCategoryWithTags, TagWithCategory } from '@/types/tag'
import type { RecipeCardData } from '@/types/recipe'

export async function getAllTagsGrouped(): Promise<TagCategoryWithTags[]> {
  const supabase = await createClient()

  const { data: categories, error: catError } = await supabase
    .from('tag_categories')
    .select('*')
    .order('display_order')

  if (catError || !categories) return []

  const { data: tags, error: tagError } = await supabase
    .from('tags')
    .select('id, slug, name, description, display_order, color, tag_category_id')
    .not('tag_category_id', 'is', null)
    .order('display_order')

  if (tagError || !tags) return []

  return (categories as unknown as TagCategoryWithTags[]).map((cat) => ({
    ...cat,
    tags: (tags as unknown as Array<Record<string, unknown>>)
      .filter((t) => t.tag_category_id === cat.id)
      .map((t) => ({
        id: t.id as number,
        slug: t.slug as string,
        name: t.name as string,
        description: t.description as string | null,
        display_order: t.display_order as number,
        color: t.color as string | null,
        category_slug: cat.slug,
        category_name: cat.name,
      })),
  }))
}

export async function getTagBySlug(slug: string): Promise<TagWithCategory | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tags')
    .select('id, slug, name, description, display_order, color, tag_category_id')
    .eq('slug', slug)
    .single()

  if (error || !data) return null

  const tag = data as unknown as Record<string, unknown>

  // Get category info
  let categorySlug: string | null = null
  let categoryName: string | null = null
  if (tag.tag_category_id) {
    const { data: cat } = await supabase
      .from('tag_categories')
      .select('slug, name')
      .eq('id', tag.tag_category_id)
      .single()
    if (cat) {
      const catData = cat as unknown as { slug: string; name: string }
      categorySlug = catData.slug
      categoryName = catData.name
    }
  }

  return {
    id: tag.id as number,
    slug: tag.slug as string,
    name: tag.name as string,
    description: tag.description as string | null,
    display_order: tag.display_order as number,
    color: tag.color as string | null,
    category_slug: categorySlug,
    category_name: categoryName,
  }
}

export async function getRecipesByTag(tagId: number, limit = 24): Promise<RecipeCardData[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('recipe_tags')
    .select(`
      recipes!inner(
        id, slug, title, description,
        total_time_minutes, servings, servings_unit,
        difficulty, cuisine, course, published_at, status,
        recipe_images(url, alt_text, is_hero)
      )
    `)
    .eq('tag_id', tagId)
    .limit(limit)

  if (error || !data) return []

  return (data as unknown as Array<{ recipes: Record<string, unknown> }>)
    .map((row) => {
      const r = row.recipes
      const images = r.recipe_images as Array<Record<string, unknown>> | null
      const heroImage = images && images.length > 0
        ? images.find((img) => img.is_hero) || images[0]
        : null
      return {
        id: r.id as number,
        slug: r.slug as string,
        title: r.title as string,
        description: r.description as string | null,
        total_time_minutes: r.total_time_minutes as number | null,
        servings: r.servings as number,
        servings_unit: r.servings_unit as string,
        difficulty: r.difficulty as RecipeCardData['difficulty'],
        cuisine: r.cuisine as string | null,
        course: r.course as string | null,
        hero_image_url: (heroImage?.url as string) || null,
        hero_image_alt: (heroImage?.alt_text as string) || null,
        published_at: r.published_at as string | null,
      }
    })
}

export async function getAllTagSlugs(): Promise<{ slug: string }[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_all_tag_slugs')
  if (error || !data) return []
  return data as unknown as { slug: string }[]
}
