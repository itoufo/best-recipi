/**
 * Insert recipe JSON files into Supabase
 * Usage: npx tsx scripts/insert-recipes.ts
 *
 * Reads all JSON files from scripts/data/recipes/*.json
 * Each file contains an array of recipes.
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Read env manually (no dotenv)
const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8')
const env: Record<string, string> = {}
for (const line of envFile.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { db: { schema: 'recipi' } }
)

interface RecipeJSON {
  slug: string
  title: string
  description: string
  introduction: string
  prep_time_minutes: number
  cook_time_minutes: number
  total_time_minutes: number
  servings: number
  servings_unit: string
  difficulty: 'easy' | 'medium' | 'hard'
  calories: number
  protein_g: number
  fat_g: number
  carbs_g: number
  fiber_g: number
  sodium_mg: number
  instructions: Array<{ step: number; text: string; tip?: string | null }>
  meta_title: string
  meta_description: string
  keywords: string[]
  cuisine: string
  course: string
  tips: string
  tag_slugs: string[]     // e.g. ["umami", "simmer", "rich"]
  category_slug: string   // e.g. "main"
  ingredients: Array<{
    slug: string
    name: string
    quantity: string
    unit: string
    preparation?: string
    is_optional?: boolean
    group_name?: string
  }>
}

async function insertRecipe(recipe: RecipeJSON): Promise<boolean> {
  // 1. Upsert recipe
  const { data: recipeRow, error: recipeErr } = await supabase
    .from('recipes')
    .upsert({
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
    }, { onConflict: 'slug' })
    .select('id')
    .single()

  if (recipeErr || !recipeRow) {
    console.error(`  ✗ Recipe ${recipe.slug}: ${recipeErr?.message}`)
    return false
  }

  const recipeId = recipeRow.id

  // 2. Link tags
  if (recipe.tag_slugs && recipe.tag_slugs.length > 0) {
    const { data: tags } = await supabase
      .from('tags')
      .select('id, slug')
      .in('slug', recipe.tag_slugs)

    if (tags && tags.length > 0) {
      await supabase.from('recipe_tags').delete().eq('recipe_id', recipeId)
      await supabase.from('recipe_tags').insert(
        tags.map(t => ({ recipe_id: recipeId, tag_id: t.id }))
      )
    }
  }

  // 3. Link category
  if (recipe.category_slug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', recipe.category_slug)
      .single()

    if (cat) {
      await supabase.from('recipe_categories').delete().eq('recipe_id', recipeId)
      await supabase.from('recipe_categories').insert({
        recipe_id: recipeId,
        category_id: cat.id,
      })
    }
  }

  // 4. Link ingredients
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId)

    for (let i = 0; i < recipe.ingredients.length; i++) {
      const ing = recipe.ingredients[i]

      // Find or create ingredient
      let ingredientId: number
      const { data: existing } = await supabase
        .from('ingredients')
        .select('id')
        .eq('slug', ing.slug)
        .single()

      if (existing) {
        ingredientId = existing.id
      } else {
        const { data: created, error: createErr } = await supabase
          .from('ingredients')
          .insert({ slug: ing.slug, name: ing.name, is_niche: false })
          .select('id')
          .single()
        if (createErr || !created) {
          console.error(`    ✗ Ingredient ${ing.name}: ${createErr?.message}`)
          continue
        }
        ingredientId = created.id
      }

      await supabase.from('recipe_ingredients').insert({
        recipe_id: recipeId,
        ingredient_id: ingredientId,
        quantity: ing.quantity,
        unit: ing.unit,
        preparation: ing.preparation || null,
        is_optional: ing.is_optional || false,
        display_order: i,
        group_name: ing.group_name || null,
      })
    }
  }

  return true
}

async function main() {
  const recipesDir = path.join(__dirname, 'data', 'recipes')
  if (!fs.existsSync(recipesDir)) {
    fs.mkdirSync(recipesDir, { recursive: true })
    console.log('Created recipes directory. Add JSON files and re-run.')
    return
  }

  const files = fs.readdirSync(recipesDir).filter(f => f.endsWith('.json')).sort()
  if (files.length === 0) {
    console.log('No recipe JSON files found in scripts/data/recipes/')
    return
  }

  let totalOk = 0
  let totalFail = 0

  for (const file of files) {
    const filePath = path.join(recipesDir, file)
    const recipes: RecipeJSON[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    console.log(`\n📄 ${file} (${recipes.length} recipes)`)

    for (const recipe of recipes) {
      const ok = await insertRecipe(recipe)
      if (ok) {
        totalOk++
        console.log(`  ✓ ${recipe.title}`)
      } else {
        totalFail++
      }
    }
  }

  console.log(`\n✅ Done: ${totalOk} succeeded, ${totalFail} failed`)
}

main().catch(console.error)
