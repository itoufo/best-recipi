import type { ReactNode } from 'react'

interface AffiliateLinkProps {
  name: string
  amazonUrl?: string
  rakutenUrl?: string
  children?: ReactNode
}

export function AffiliateLink({ name, amazonUrl, rakutenUrl }: AffiliateLinkProps) {
  if (!amazonUrl && !rakutenUrl) return null

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground mb-3">この食材を購入</p>
      <p className="text-sm font-medium mb-3">{name}</p>
      <div className="flex flex-col gap-2">
        {amazonUrl && (
          <a
            href={amazonUrl}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="flex items-center justify-center rounded-lg bg-[#FF9900] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Amazonで見る
          </a>
        )}
        {rakutenUrl && (
          <a
            href={rakutenUrl}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="flex items-center justify-center rounded-lg bg-[#BF0000] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            楽天で見る
          </a>
        )}
      </div>
    </div>
  )
}
