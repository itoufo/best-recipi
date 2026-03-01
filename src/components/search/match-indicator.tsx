interface MatchIndicatorProps {
  matchCount: number
  totalQueried: number
}

export function MatchIndicator({ matchCount, totalQueried }: MatchIndicatorProps) {
  if (totalQueried === 0) return null

  const ratio = matchCount / totalQueried
  const isFullMatch = matchCount === totalQueried

  return (
    <div className="flex items-center gap-2">
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isFullMatch ? 'bg-accent' : 'bg-accent/50'
          }`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <span className={`shrink-0 text-xs font-medium ${isFullMatch ? 'text-accent-dark' : 'text-muted-foreground'}`}>
        {isFullMatch ? (
          <span className="inline-flex items-center gap-1">
            <CheckIcon />
            全食材一致
          </span>
        ) : (
          `${matchCount}/${totalQueried} 食材一致`
        )}
      </span>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
