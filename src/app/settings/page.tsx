'use client'

import { useEffect, useState } from 'react'
import { usePreferences } from '@/hooks/use-preferences'
import { createClient } from '@/lib/supabase/client'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import type { TagCategoryWithTags } from '@/types/tag'

export default function SettingsPage() {
  const { preferences, togglePreference, hasPreference } = usePreferences()
  const [categories, setCategories] = useState<TagCategoryWithTags[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    Promise.all([
      supabase.from('tag_categories').select('*').order('display_order'),
      supabase.from('tags').select('id, slug, name, description, display_order, color, tag_category_id').not('tag_category_id', 'is', null).order('display_order'),
    ]).then(([catRes, tagRes]) => {
      if (catRes.data && tagRes.data) {
        const cats = (catRes.data as unknown as TagCategoryWithTags[]).map((cat) => ({
          ...cat,
          tags: (tagRes.data as unknown as Array<Record<string, unknown>>)
            .filter((t) => t.tag_category_id === cat.id)
            .map((t) => ({
              id: t.id as number,
              slug: t.slug as string,
              name: t.name as string,
              description: t.description as string | null,
              display_order: t.display_order as number,
              color: t.color as string | null,
              category_slug: cat.slug,
              category_name: cat.name,
            })),
        }))
        setCategories(cats)
      }
      setLoading(false)
    })
  }, [])

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Breadcrumb items={[
        { label: 'ホーム', href: '/' },
        { label: '好み設定' },
      ]} />

      <h1 className="font-serif text-3xl font-bold mt-4 mb-2">好み設定</h1>
      <p className="text-muted-foreground mb-8">
        好みのタグを選ぶと、あなたにおすすめのレシピが表示されます
      </p>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">読み込み中...</div>
      ) : (
        <div className="space-y-8">
          {categories.map((cat) => (
            <section key={cat.id}>
              <h2 className="font-serif text-lg font-bold mb-1">{cat.name}</h2>
              {cat.description && (
                <p className="text-sm text-muted-foreground mb-3">{cat.description}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {cat.tags.map((tag) => {
                  const selected = hasPreference(tag.id)
                  return (
                    <button
                      key={tag.id}
                      onClick={() => togglePreference(tag.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                        selected
                          ? 'bg-accent text-white shadow-sm'
                          : 'border border-border text-muted-foreground hover:border-accent hover:text-accent'
                      }`}
                    >
                      {tag.color && (
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: selected ? '#fff' : tag.color }}
                        />
                      )}
                      {tag.name}
                    </button>
                  )
                })}
              </div>
            </section>
          ))}

          {preferences.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {preferences.length}個のタグを選択中
            </p>
          )}
        </div>
      )}
    </div>
  )
}
