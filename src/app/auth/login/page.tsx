import type { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'
import { Breadcrumb } from '@/components/layout/breadcrumb'

export const metadata: Metadata = {
  title: 'ログイン',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <Breadcrumb items={[
        { label: 'ホーム', href: '/' },
        { label: 'ログイン' },
      ]} />

      <h1 className="font-serif text-3xl font-bold mt-4 mb-2 text-center">ログイン</h1>
      <p className="text-center text-sm text-muted-foreground mb-8">
        お気に入りや好みを保存してパーソナライズしよう
      </p>

      <LoginForm mode="login" />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        アカウントをお持ちでない方は{' '}
        <Link href="/auth/signup" className="text-accent hover:underline">
          新規登録
        </Link>
      </p>
    </div>
  )
}
