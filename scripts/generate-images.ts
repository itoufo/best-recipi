/**
 * Recipi - AI Image Generation Script
 *
 * Usage: npx tsx scripts/generate-images.ts [recipe-slug]
 *
 * Reads all recipe JSONs from scripts/data/recipes/ and generates
 * food photography prompts. Variant recipes get taste-specific styling
 * (e.g., spicy = warm/red tones, light = bright/airy).
 *
 * For MCP use: Claude Code can call nanobanana_generate with these prompts.
 */

import * as fs from 'fs'
import * as path from 'path'

const RECIPES_DIR = path.join(__dirname, 'data', 'recipes')
const IMAGES_DIR = path.join(__dirname, 'output', 'images')

interface RecipeJson {
  slug: string
  title: string
  base_dish?: string
  tag_slugs?: string[]
  cuisine?: string
}

// Taste tag → visual style mapping for variant-aware prompts
const TASTE_STYLES: Record<string, string> = {
  sweet: 'warm golden lighting, honey tones, soft and inviting presentation',
  spicy: 'vibrant red and orange accents, steam rising, bold and intense presentation',
  light: 'bright airy lighting, white/light blue tones, refreshing and clean presentation, lemon garnish',
  rich: 'deep warm tones, glossy sauce, luxurious and indulgent presentation, dark moody lighting',
  sour: 'citrus accents, bright yellow-green tones, zesty fresh presentation',
  umami: 'deep brown tones, rich texture visible, savory and comforting presentation',
}

const CUISINE_PLATING: Record<string, string> = {
  '和食': 'traditional Japanese ceramic plate, wooden chopsticks, minimalist wabi-sabi aesthetic',
  '中華': 'Chinese-style ceramic bowl, bamboo mat underneath, vibrant and abundant presentation',
  'イタリアン': 'rustic Italian ceramic plate, olive oil drizzle visible, Mediterranean herbs garnish',
  '韓国料理': 'Korean stone bowl or traditional plate, red pepper flakes visible, banchan style',
  'フレンチ': 'elegant white porcelain plate, sauce artfully drizzled, fine dining presentation',
  'タイ料理': 'colorful Thai plate, banana leaf accent, tropical herbs garnish, vibrant colors',
}

function getImagePrompt(recipe: RecipeJson): string {
  const tasteTags = (recipe.tag_slugs || []).filter(t => t in TASTE_STYLES)
  const tasteStyle = tasteTags.map(t => TASTE_STYLES[t]).join(', ')

  const cuisinePlating = recipe.cuisine ? (CUISINE_PLATING[recipe.cuisine] || '') : ''

  const basePrompt = `Professional food photography of ${recipe.title}`
  const style = 'Japanese editorial magazine style, overhead top-down angle, natural window lighting'
  const technical = 'shallow depth of field, warm color temperature, 16:9 aspect ratio, high resolution, food magazine quality'

  const parts = [basePrompt, style]

  if (cuisinePlating) {
    parts.push(cuisinePlating)
  } else {
    parts.push('on a minimalist ceramic plate, wooden table background')
  }

  parts.push('garnished with fresh herbs')

  // Add taste-specific visual cues for variants
  if (tasteStyle) {
    parts.push(tasteStyle)
  }

  // If it's a variant, emphasize the flavor difference visually
  if (recipe.base_dish) {
    parts.push('distinct flavor identity clearly visible in plating and garnish')
  }

  parts.push(technical)

  return parts.join(', ')
}

function getAllRecipes(): RecipeJson[] {
  if (!fs.existsSync(RECIPES_DIR)) {
    console.error(`Recipe directory not found: ${RECIPES_DIR}`)
    return []
  }

  const files = fs.readdirSync(RECIPES_DIR).filter(f => f.endsWith('.json')).sort()
  const allRecipes: RecipeJson[] = []

  for (const file of files) {
    const filePath = path.join(RECIPES_DIR, file)
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    const recipes = Array.isArray(data) ? data : [data]
    allRecipes.push(...recipes)
  }

  return allRecipes
}

async function main() {
  const args = process.argv.slice(2)
  const targetSlug = args[0]
  const generateMode = args.includes('--generate')

  fs.mkdirSync(IMAGES_DIR, { recursive: true })

  const allRecipes = getAllRecipes()
  const targetRecipes = targetSlug
    ? allRecipes.filter(r => r.slug === targetSlug || r.base_dish === targetSlug)
    : allRecipes

  if (targetRecipes.length === 0) {
    console.log(`No recipes found${targetSlug ? ` matching "${targetSlug}"` : ''}`)
    return
  }

  // Stats
  const variantRecipes = targetRecipes.filter(r => r.base_dish)
  const regularRecipes = targetRecipes.filter(r => !r.base_dish)
  const existingImages = targetRecipes.filter(r => fs.existsSync(path.join(IMAGES_DIR, `${r.slug}.png`)))
  const needImages = targetRecipes.filter(r => !fs.existsSync(path.join(IMAGES_DIR, `${r.slug}.png`)))

  console.log('Image Generation Prompts')
  console.log('========================')
  console.log(`Total recipes: ${targetRecipes.length}`)
  console.log(`  Regular: ${regularRecipes.length}`)
  console.log(`  Variants: ${variantRecipes.length}`)
  console.log(`  Already have images: ${existingImages.length}`)
  console.log(`  Need images: ${needImages.length}`)
  console.log('')

  if (generateMode) {
    console.log('🎨 Generate mode: Use nanobanana MCP tool with prompts below')
  } else {
    console.log('📋 Preview mode: showing prompts (add --generate to start)')
  }
  console.log('')

  for (const recipe of needImages) {
    const imagePath = path.join(IMAGES_DIR, `${recipe.slug}.png`)
    const prompt = getImagePrompt(recipe)

    console.log(`[RECIPE]  ${recipe.title}`)
    console.log(`[SLUG]    ${recipe.slug}`)
    if (recipe.base_dish) {
      console.log(`[VARIANT] base_dish=${recipe.base_dish}`)
    }
    console.log(`[PROMPT]  ${prompt}`)
    console.log(`[OUTPUT]  ${imagePath}`)
    console.log('')
  }

  if (needImages.length === 0) {
    console.log('All recipes already have images!')
  } else {
    console.log(`\n📝 ${needImages.length} images to generate.`)
    console.log('Use nanobanana MCP tool with the prompts above.')
    console.log('Then upload to Supabase Storage (recipi-images bucket) and update recipe records.')
  }
}

main().catch(console.error)
