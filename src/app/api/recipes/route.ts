import { NextRequest, NextResponse } from 'next/server'
import { getPublishedRecipes } from '@/lib/queries/recipes'

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const course = params.get('course') || undefined
  const cuisine = params.get('cuisine') || undefined
  const difficulty = params.get('difficulty') || undefined
  const tagSlug = params.get('tagSlug') || undefined
  const offset = Number(params.get('offset') || '0')
  const limit = Number(params.get('limit') || '12')

  const recipes = await getPublishedRecipes({
    course,
    cuisine,
    difficulty,
    tagSlug,
    limit: limit + 1,
    offset,
  })

  const hasMore = recipes.length > limit
  const result = hasMore ? recipes.slice(0, limit) : recipes

  return NextResponse.json({ recipes: result, hasMore })
}
