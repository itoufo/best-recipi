import { Badge } from '@/components/ui/badge'
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/lib/constants/site'
import { minutesToJapanese } from '@/lib/utils/format'

interface RecipeMetaBarProps {
  totalTime: number | null
  prepTime: number | null
  cookTime: number | null
  servings: number
  servingsUnit: string
  difficulty: string
}

export function RecipeMetaBar({
  totalTime,
  prepTime,
  cookTime,
  servings,
  servingsUnit,
  difficulty,
}: RecipeMetaBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      {totalTime && (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <ClockIcon />
          <span>{minutesToJapanese(totalTime)}</span>
          {prepTime && cookTime && (
            <span className="text-xs text-muted-foreground/60">
              (下準備{minutesToJapanese(prepTime)} + 調理{minutesToJapanese(cookTime)})
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-1.5 text-muted-foreground">
        <ServingsIcon />
        <span>{servings}{servingsUnit}</span>
      </div>

      <Badge
        className={DIFFICULTY_COLORS[difficulty] || ''}
        size="sm"
      >
        {DIFFICULTY_LABELS[difficulty] || difficulty}
      </Badge>
    </div>
  )
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function ServingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
