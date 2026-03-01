import type { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'
import { Breadcrumb } from '@/components/layout/breadcrumb'

export const metadata: Metadata = {
  title: '新規登録',
  robots: { index: false, follow: false },
}

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <Breadcrumb items={[
        { label: 'ホーム', href: '/' },
        { label: '新規登録' },
      ]} />

      <h1 className="font-serif text-3xl font-bold mt-4 mb-2 text-center">新規登録</h1>
      <p className="text-center text-sm text-muted-foreground mb-8">
        無料アカウントを作成してお気に入りや好みを保存しよう
      </p>

      <LoginForm mode="signup" />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        すでにアカウントをお持ちの方は{' '}
        <Link href="/auth/login" className="text-accent hover:underline">
          ログイン
        </Link>
      </p>
    </div>
  )
}
