'use client'

import { useFavorites } from '@/hooks/use-favorites'

interface FavoriteButtonProps {
  recipeId: number
  size?: 'sm' | 'md'
}

export function FavoriteButton({ recipeId, size = 'md' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const active = isFavorite(recipeId)
  const iconSize = size === 'sm' ? 16 : 20

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite(recipeId)
      }}
      className={`inline-flex items-center justify-center rounded-full transition-colors ${
        size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'
      } ${
        active
          ? 'bg-red-50 text-red-500'
          : 'bg-background/80 text-muted-foreground hover:text-red-500'
      }`}
      aria-label={active ? 'お気に入りから削除' : 'お気に入りに追加'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  )
}
