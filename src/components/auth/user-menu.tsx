'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/auth-provider'

export function UserMenu() {
  const { user, loading, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (loading) return null

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        ログイン
      </Link>
    )
  }

  const displayName = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'ユーザー'
  const avatarUrl = user.user_metadata?.avatar_url

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80"
        aria-label="ユーザーメニュー"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white text-sm font-medium">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-card py-1 shadow-lg z-50">
          <div className="border-b border-border px-4 py-2">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <Link
            href="/favorites"
            className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            onClick={() => setOpen(false)}
          >
            お気に入り
          </Link>
          <Link
            href="/settings"
            className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            onClick={() => setOpen(false)}
          >
            好み設定
          </Link>
          <button
            onClick={() => {
              signOut()
              setOpen(false)
            }}
            className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors"
          >
            ログアウト
          </button>
        </div>
      )}
    </div>
  )
}
