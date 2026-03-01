import Image from 'next/image'
import type { RecipeImage } from '@/types/recipe'

interface RecipeHeroProps {
  images: RecipeImage[] | null
  title: string
}

export function RecipeHero({ images, title }: RecipeHeroProps) {
  const heroImage = images?.find((img) => img.is_hero) || images?.[0]

  if (!heroImage) {
    return (
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted flex items-center justify-center">
        <span className="text-6xl text-muted-foreground/20">🍽</span>
      </div>
    )
  }

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
      <Image
        src={heroImage.url}
        alt={heroImage.alt_text || title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 800px"
        priority
      />
    </div>
  )
}
