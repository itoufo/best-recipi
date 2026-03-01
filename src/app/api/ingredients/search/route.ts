import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get('ids')
  if (!idsParam) {
    return NextResponse.json({ recipes: [] })
  }

  const ids = idsParam.split(',').map(Number).filter(Boolean)
  if (ids.length === 0 || ids.length > 10) {
    return NextResponse.json({ recipes: [] })
  }

  const matchAll = request.nextUrl.searchParams.get('match_all') === 'true'

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('search_recipes_by_ingredients', {
    ingredient_ids: ids,
    match_all: matchAll,
    result_limit: 30,
  })

  if (error) {
    return NextResponse.json({ recipes: [] })
  }

  return NextResponse.json({ recipes: data || [] })
}
