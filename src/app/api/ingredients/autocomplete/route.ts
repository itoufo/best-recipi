import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 1) {
    return NextResponse.json({ ingredients: [] })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('autocomplete_ingredients', {
    query: q,
    result_limit: 8,
  })

  if (error) {
    return NextResponse.json({ ingredients: [] })
  }

  return NextResponse.json({ ingredients: data || [] })
}
