/**
 * Recipi - AI Recipe Generation Script
 *
 * Usage: npx tsx scripts/generate-recipes.ts [ingredient-slug] [count]
 *
 * Generates recipe JSON files using Claude API.
 * Output: scripts/output/recipes/{slug}.json
 *
 * Environment: ANTHROPIC_API_KEY
 */

import Anthropic from '@anthropic-ai/sdk'
import * as fs from 'fs'
import * as path from 'path'

const OUTPUT_DIR = path.join(__dirname, 'output', 'recipes')

interface GeneratedRecipe {
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
  instructions: Array<{
    step: number
    text: string
    tip: string | null
  }>
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

const SYSTEM_PROMPT = `あなたは日本のプロの料理研究家です。ニッチ食材を使った本格的なレシピを日本語で作成してください。

以下のJSON形式で正確に出力してください（コードブロックなし、純粋なJSONのみ）:

{
  "slug": "食材名-料理名（ローマ字ハイフン区切り）",
  "title": "レシピタイトル（15-25文字）",
  "description": "レシピの短い説明（50-100文字）",
  "introduction": "記事冒頭の導入文（100-200文字）",
  "prep_time_minutes": 数値,
  "cook_time_minutes": 数値,
  "total_time_minutes": 数値,
  "servings": 2,
  "servings_unit": "人前",
  "difficulty": "easy|medium|hard",
  "calories": 数値,
  "protein_g": 数値,
  "fat_g": 数値,
  "carbs_g": 数値,
  "fiber_g": 数値,
  "sodium_mg": 数値,
  "instructions": [
    { "step": 1, "text": "具体的な手順（50-100文字）", "tip": "ポイントやコツ（あれば）" }
  ],
  "meta_title": "SEOタイトル",
  "meta_description": "SEO説明文（120文字以内）",
  "keywords": ["キーワード1", "キーワード2"],
  "cuisine": "和食|イタリアン|フレンチ|中華|エスニック|その他",
  "course": "前菜|メイン|副菜|スープ|デザート|ドリンク",
  "tips": "シェフのコツ（100-200文字）",
  "ingredients": [
    {
      "name": "食材名（日本語）",
      "slug": "ローマ字",
      "quantity": "数量",
      "unit": "単位",
      "preparation": "下準備（みじん切り等）",
      "is_optional": false,
      "group_name": null
    }
  ]
}

ルール:
- 家庭のキッチンで実現可能なレシピにすること
- 手順は5-8ステップが理想
- 栄養情報は一般的な目安を記載
- slugは英語ローマ字、ハイフン区切り
- ニッチ食材を主役にする（レシピの特徴として目立たせる）
- 日本の家庭で入手可能な代替材料も意識する`

async function generateRecipesForIngredient(
  ingredientName: string,
  ingredientSlug: string,
  count: number
): Promise<GeneratedRecipe[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required')
  }

  const client = new Anthropic({ apiKey })
  const recipes: GeneratedRecipe[] = []

  const prompt = `「${ingredientName}」を主役にした家庭料理レシピを${count}つ作成してください。

バリエーション要件:
- 異なる料理ジャンル（和食、洋食、エスニック等）を混ぜる
- 異なるコース（メイン、前菜、副菜等）を混ぜる
- 難易度も混ぜる（簡単なものから本格的なものまで）

${count}つのレシピをJSON配列で返してください: [recipe1, recipe2, ...]`

  console.log(`Generating ${count} recipes for ${ingredientName}...`)

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type')
  }

  try {
    const parsed = JSON.parse(content.text)
    const arr = Array.isArray(parsed) ? parsed : [parsed]
    recipes.push(...arr)
    console.log(`  Generated ${arr.length} recipes`)
  } catch (e) {
    // Try to extract JSON from markdown code block
    const match = content.text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
    if (match) {
      const parsed = JSON.parse(match[1])
      const arr = Array.isArray(parsed) ? parsed : [parsed]
      recipes.push(...arr)
      console.log(`  Generated ${arr.length} recipes (from code block)`)
    } else {
      console.error(`  Failed to parse response for ${ingredientName}:`, e)
    }
  }

  return recipes
}

async function main() {
  const args = process.argv.slice(2)
  const ingredientSlug = args[0]
  const count = parseInt(args[1] || '5', 10)

  // Ensure output dir exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  if (ingredientSlug) {
    // Generate for specific ingredient
    const dataPath = path.join(__dirname, 'data', 'niche-ingredients.json')
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

    let found: { name: string; slug: string } | null = null
    for (const cat of data.categories) {
      const ing = cat.ingredients.find((i: { slug: string }) => i.slug === ingredientSlug)
      if (ing) {
        found = ing
        break
      }
    }

    if (!found) {
      console.error(`Ingredient "${ingredientSlug}" not found in data file`)
      process.exit(1)
    }

    const recipes = await generateRecipesForIngredient(found.name, found.slug, count)
    const outPath = path.join(OUTPUT_DIR, `${found.slug}.json`)
    fs.writeFileSync(outPath, JSON.stringify(recipes, null, 2), 'utf-8')
    console.log(`Saved ${recipes.length} recipes to ${outPath}`)
  } else {
    // Generate for all ingredients
    const dataPath = path.join(__dirname, 'data', 'niche-ingredients.json')
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

    for (const cat of data.categories) {
      console.log(`\nCategory: ${cat.name}`)
      for (const ing of cat.ingredients) {
        const outPath = path.join(OUTPUT_DIR, `${ing.slug}.json`)
        if (fs.existsSync(outPath)) {
          console.log(`  Skipping ${ing.name} (already exists)`)
          continue
        }

        try {
          const recipes = await generateRecipesForIngredient(ing.name, ing.slug, count)
          fs.writeFileSync(outPath, JSON.stringify(recipes, null, 2), 'utf-8')
          console.log(`  Saved ${recipes.length} recipes to ${outPath}`)
          // Rate limit
          await new Promise((r) => setTimeout(r, 2000))
        } catch (err) {
          console.error(`  Error generating for ${ing.name}:`, err)
        }
      }
    }
  }

  console.log('\nDone!')
}

main().catch(console.error)
