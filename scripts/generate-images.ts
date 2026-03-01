/**
 * Recipi - AI Image Generation Script
 *
 * Usage: npx tsx scripts/generate-images.ts [ingredient-slug]
 *
 * Generates food photography images using nanobanana MCP / Gemini.
 * This script is meant to be run from Claude Code with MCP access.
 *
 * For manual use, set images via Supabase dashboard or import script.
 */

import * as fs from 'fs'
import * as path from 'path'

const RECIPES_DIR = path.join(__dirname, 'output', 'recipes')
const IMAGES_DIR = path.join(__dirname, 'output', 'images')

interface RecipeJson {
  slug: string
  title: string
}

function getImagePrompt(title: string): string {
  return `Professional food photography of ${title}, Japanese editorial style, overhead top-down angle, natural window lighting, on a minimalist ceramic plate, wooden table background, garnished with fresh herbs, shallow depth of field, warm color temperature, 16:9 aspect ratio, high resolution, food magazine quality`
}

async function main() {
  const args = process.argv.slice(2)
  const targetSlug = args[0]

  fs.mkdirSync(IMAGES_DIR, { recursive: true })

  const files = fs.readdirSync(RECIPES_DIR).filter((f) => f.endsWith('.json'))
  const targetFiles = targetSlug
    ? files.filter((f) => f === `${targetSlug}.json`)
    : files

  console.log('Image Generation Prompts')
  console.log('========================')
  console.log('')
  console.log('Use these prompts with nanobanana MCP tool (mcp__nanobanana__nanobanana_generate)')
  console.log('or any image generation service.')
  console.log('')

  for (const file of targetFiles) {
    const filePath = path.join(RECIPES_DIR, file)
    const recipes: RecipeJson[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    const arr = Array.isArray(recipes) ? recipes : [recipes]

    for (const recipe of arr) {
      const imagePath = path.join(IMAGES_DIR, `${recipe.slug}.png`)
      if (fs.existsSync(imagePath)) {
        console.log(`[SKIP] ${recipe.slug} (already exists)`)
        continue
      }

      console.log(`[RECIPE] ${recipe.title}`)
      console.log(`[SLUG]   ${recipe.slug}`)
      console.log(`[PROMPT] ${getImagePrompt(recipe.title)}`)
      console.log(`[OUTPUT] ${imagePath}`)
      console.log('')
    }
  }

  console.log('To generate images, use nanobanana MCP tool with the prompts above.')
  console.log('Then upload to Supabase Storage (recipi-images bucket) and update recipe records.')
}

main().catch(console.error)
