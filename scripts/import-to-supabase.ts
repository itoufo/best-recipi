/**
 * Recipi - Import Generated Recipes to Supabase
 *
 * Usage: npx tsx scripts/import-to-supabase.ts [ingredient-slug]
 *
 * Reads JSON files from scripts/output/recipes/ and upserts to Supabase.
 * Uses service_role key to bypass RLS.
 *
 * Environment: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const RECIPES_DIR = path.join(__dirname, 'output', 'recipes')
const INGREDIENTS_DATA = path.join(__dirname, 'data', 'niche-ingredients.json')

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }

  return createClient(url, key, { db: { schema: 'recipi' } })
}

interface RecipeJson {
  slug: string
  title: string
  description: string
  introduction: string
  prep_time_minutes: number
  cook_time_minutes: number
  total_time_minutes: number
  servings: number
  servings_unit: string
  difficulty: string
  calories: number
  protein_g: number
  fat_g: number
  carbs_g: number
  fiber_g: number
  sodium_mg: number
  instructions: Array<{ step: number; text: string; tip: string | null }>
  meta_title: string
  meta_description: string
  keywords: string[]
  cuisine: string
  course: string
  tips: string
  ingredients: Array<{
    name: string
    slug: string
    quantity: string
    unit: string
    preparation: string | null
    is_optional: boolean
    group_name: string | null
  }>
}

async function ensureIngredient(
  supabase: ReturnType<typeof createClient>,
  ingredientSlug: string,
  ingredientName: string
): Promise<number> {
  // Try to find existing
  const { data: existing } = await supabase
    .from('ingredients')
    .select('id')
    .eq('slug', ingredientSlug)
    .single()

  if (existing) return existing.id

  // Create new
  const { data: created, error } = await supabase
    .from('ingredients')
    .insert({ slug: ingredientSlug, name: ingredientName, is_niche: true })
    .select('id')
    .single()

  if (error) throw error
  return created!.id
}

async function importRecipe(
  supabase: ReturnType<typeof createClient>,
  recipe: RecipeJson
): Promise<void> {
  // 1. Upsert recipe
  const { data: recipeRow, error: recipeError } = await supabase
    .from('recipes')
    .upsert(
      {
        slug: recipe.slug,
        title: recipe.title,
        description: recipe.description,
        introduction: recipe.introduction,
        prep_time_minutes: recipe.prep_time_minutes,
        cook_time_minutes: recipe.cook_time_minutes,
        total_time_minutes: recipe.total_time_minutes,
        servings: recipe.servings,
        servings_unit: recipe.servings_unit,
        difficulty: recipe.difficulty,
        calories: recipe.calories,
        protein_g: recipe.protein_g,
        fat_g: recipe.fat_g,
        carbs_g: recipe.carbs_g,
        fiber_g: recipe.fiber_g,
        sodium_mg: recipe.sodium_mg,
        instructions: recipe.instructions,
        meta_title: recipe.meta_title,
        meta_description: recipe.meta_description,
        keywords: recipe.keywords,
        cuisine: recipe.cuisine,
        course: recipe.course,
        tips: recipe.tips,
        status: 'published',
        published_at: new Date().toISOString(),
      },
      { onConflict: 'slug' }
    )
    .select('id')
    .single()

  if (recipeError) throw recipeError
  const recipeId = recipeRow!.id

  // 2. Delete existing recipe_ingredients (for re-import)
  await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId)

  // 3. Upsert ingredients and create links
  for (let i = 0; i < recipe.ingredients.length; i++) {
    const ing = recipe.ingredients[i]
    const ingredientId = await ensureIngredient(supabase, ing.slug, ing.name)

    await supabase.from('recipe_ingredients').insert({
      recipe_id: recipeId,
      ingredient_id: ingredientId,
      quantity: ing.quantity,
      unit: ing.unit,
      preparation: ing.preparation,
      is_optional: ing.is_optional,
      display_order: i,
      group_name: ing.group_name,
    })
  }
}

async function importIngredientsFromData(supabase: ReturnType<typeof createClient>) {
  if (!fs.existsSync(INGREDIENTS_DATA)) return

  const data = JSON.parse(fs.readFileSync(INGREDIENTS_DATA, 'utf-8'))

  for (const cat of data.categories) {
    for (const ing of cat.ingredients) {
      const { error } = await supabase.from('ingredients').upsert(
        {
          slug: ing.slug,
          name: ing.name,
          name_en: ing.name_en || null,
          category: cat.name,
          season: ing.season || null,
          origin: ing.origin || null,
          is_niche: true,
        },
        { onConflict: 'slug' }
      )
      if (error) {
        console.error(`  Error upserting ingredient ${ing.name}:`, error.message)
      }
    }
  }
  console.log('Imported ingredient master data')
}

async function main() {
  const args = process.argv.slice(2)
  const targetSlug = args[0]

  const supabase = getSupabase()

  // Import ingredient master data first
  await importIngredientsFromData(supabase)

  // Get recipe files to import
  const files = fs.readdirSync(RECIPES_DIR).filter((f) => f.endsWith('.json'))

  const targetFiles = targetSlug
    ? files.filter((f) => f === `${targetSlug}.json`)
    : files

  if (targetFiles.length === 0) {
    console.log('No recipe files found to import')
    return
  }

  let total = 0
  let errors = 0

  for (const file of targetFiles) {
    const filePath = path.join(RECIPES_DIR, file)
    console.log(`\nImporting ${file}...`)

    try {
      const recipes: RecipeJson[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      const arr = Array.isArray(recipes) ? recipes : [recipes]

      for (const recipe of arr) {
        try {
          await importRecipe(supabase, recipe)
          console.log(`  ✓ ${recipe.title}`)
          total++
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err)
          console.error(`  ✗ ${recipe.title}: ${message}`)
          errors++
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`  Failed to read ${file}: ${message}`)
    }
  }

  console.log(`\nDone! Imported ${total} recipes, ${errors} errors`)
}

main().catch(console.error)
