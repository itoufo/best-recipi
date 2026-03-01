import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const tagIds = request.nextUrl.searchParams.get('tag_ids')
  if (!tagIds) {
    return NextResponse.json({ recipes: [] })
  }

  const ids = tagIds.split(',').map(Number).filter(Boolean)
  if (ids.length === 0) {
    return NextResponse.json({ recipes: [] })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_recommended_recipes', {
    user_tag_ids: ids,
    result_limit: 8,
  })

  if (error) {
    return NextResponse.json({ recipes: [] })
  }

  return NextResponse.json({ recipes: data || [] })
}
