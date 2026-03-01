import type { Metadata } from 'next'
import { getAllTagsGrouped } from '@/lib/queries/tags'
import { TagCategorySection } from '@/components/tags/tag-category-section'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { SITE } from '@/lib/constants/site'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'タグで探す',
  description: '味の傾向・食感・調理法・シーンなど、多彩なタグからレシピを探せます。',
  alternates: {
    canonical: `${SITE.url}/tags`,
  },
}

export default async function TagsPage() {
  const categories = await getAllTagsGrouped()

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Breadcrumb items={[
        { label: 'ホーム', href: '/' },
        { label: 'タグで探す' },
      ]} />

      <h1 className="font-serif text-3xl font-bold mt-4 mb-2">タグで探す</h1>
      <p className="text-muted-foreground mb-8">
        味・食感・調理法・シーンからぴったりのレシピを見つけよう
      </p>

      <div className="space-y-10">
        {categories.map((category) => (
          <TagCategorySection key={category.id} category={category} />
        ))}
      </div>
    </div>
  )
}
