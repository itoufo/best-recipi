import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getAllCategories } from '@/lib/queries/categories'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { SITE } from '@/lib/constants/site'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'カテゴリ',
  description: 'レシピカテゴリ一覧。前菜、メインディッシュ、デザートなど目的別にレシピを探せます。',
  alternates: {
    canonical: `${SITE.url}/categories`,
  },
}

export default async function CategoriesPage() {
  const categories = await getAllCategories()

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Breadcrumb items={[
        { label: 'ホーム', href: '/' },
        { label: 'カテゴリ' },
      ]} />

      <h1 className="font-serif text-3xl font-bold mt-4 mb-8">カテゴリ</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group relative overflow-hidden rounded-xl aspect-[4/3] border border-border"
          >
            {category.image_url ? (
              <Image
                src={category.image_url}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="absolute inset-0 bg-accent-secondary/10" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h2 className="font-serif text-lg font-bold text-white">
                {category.name}
              </h2>
              {category.description && (
                <p className="mt-1 text-xs text-white/70 line-clamp-2">
                  {category.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
