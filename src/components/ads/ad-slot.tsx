interface AdSlotProps {
  slot: string
  format?: 'auto' | 'rectangle' | 'leaderboard'
  className?: string
}

export function AdSlot({ slot, format = 'auto', className = '' }: AdSlotProps) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  // Don't render if no AdSense ID configured
  if (!adsenseId || adsenseId === 'ca-pub-xxxxx') {
    return null
  }

  const formatClass =
    format === 'rectangle'
      ? 'ad-slot ad-slot--rectangle'
      : format === 'leaderboard'
      ? 'ad-slot ad-slot--leaderboard'
      : 'ad-slot'

  return (
    <div className={`${formatClass} ${className}`} data-ad-slot={slot}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adsenseId}
        data-ad-slot={slot}
        data-ad-format={format === 'auto' ? 'auto' : undefined}
        data-full-width-responsive="true"
      />
    </div>
  )
}
