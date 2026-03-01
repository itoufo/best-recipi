import Link from 'next/link'
import { SITE } from '@/lib/constants/site'

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50 mt-16">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="font-serif text-xl font-bold text-foreground">
              {SITE.name}
            </Link>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {SITE.tagline}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              コンテンツ
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/recipes" className="text-sm text-foreground hover:text-accent transition-colors">
                  レシピ一覧
                </Link>
              </li>
              <li>
                <Link href="/ingredients" className="text-sm text-foreground hover:text-accent transition-colors">
                  食材図鑑
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-sm text-foreground hover:text-accent transition-colors">
                  カテゴリ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              サイト情報
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/about" className="text-sm text-foreground hover:text-accent transition-colors">
                  Recipiについて
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-foreground hover:text-accent transition-colors">
                  プライバシーポリシー
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
