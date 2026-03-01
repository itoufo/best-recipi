export const SITE = {
  name: 'Best Recipi',
  tagline: 'どんな食材も、おいしく。',
  description: '味・食感・シーンで探せるレシピサイト。あなたの好みにぴったりの一皿を見つけよう。',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://recipi.jp',
  locale: 'ja_JP',
  language: 'ja',
  author: 'Recipi編集部',
  ogImage: '/og-default.jpg',
} as const

export const NAV_ITEMS = [
  { label: 'レシピ', href: '/recipes' },
  { label: 'タグで探す', href: '/tags' },
  { label: 'カテゴリ', href: '/categories' },
] as const

export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: '簡単',
  medium: '普通',
  hard: '上級',
}

export const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-amber-100 text-amber-800',
  hard: 'bg-red-100 text-red-800',
}
