import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { IngredientSearchPanel } from '@/components/search/ingredient-search-panel'
import { SITE } from '@/lib/constants/site'

export const metadata: Metadata = {
  title: `食材で探す | ${SITE.name}`,
  description: '冷蔵庫にある食材を入力して、作れるレシピを探しましょう。複数の食材を組み合わせて検索できます。',
  robots: { index: true, follow: true },
}

async function getPopularIngredients() {
  const supabase = await createClient()
  const { data } = await (supabase
    .from('ingredients') as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: boolean) => {
          order: (col: string, opts: { ascending: boolean }) => {
            limit: (n: number) => Promise<{ data: { id: number; name: string }[] | null }>
          }
        }
      }
    })
    .select('id, name')
    .eq('is_niche', false)
    .order('name', { ascending: true })
    .limit(20)

  return (data || []) as { id: number; name: string }[]
}

export default async function IngredientSearchPage() {
  const popularIngredients = await getPopularIngredients()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="パンくずリスト">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/" className="transition-colors hover:text-foreground">
              ホーム
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground font-medium">食材で探す</li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold">食材で探す</h1>
        <p className="mt-2 text-muted-foreground">
          冷蔵庫にある食材を入力して、作れるレシピを見つけましょう
        </p>
      </div>

      {/* Search Panel (Client) */}
      <IngredientSearchPanel popularIngredients={popularIngredients} />
    </div>
  )
}
