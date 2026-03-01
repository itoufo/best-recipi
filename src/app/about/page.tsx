import type { Metadata } from 'next'
import { SITE } from '@/lib/constants/site'
import { Breadcrumb } from '@/components/layout/breadcrumb'

export const metadata: Metadata = {
  title: 'Recipiについて',
  description: `${SITE.name}は、サフラン、ポルチーニ、コールラビなどニッチ食材に特化したレシピサイトです。`,
  alternates: { canonical: `${SITE.url}/about` },
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Breadcrumb items={[
        { label: 'ホーム', href: '/' },
        { label: 'Recipiについて' },
      ]} />

      <article className="mt-4 space-y-6">
        <h1 className="font-serif text-3xl font-bold">Recipiについて</h1>

        <p className="text-base leading-relaxed">
          <strong>{SITE.name}</strong>は、スーパーマーケットではなかなか出会えない
          「ニッチ食材」に特化したレシピサイトです。
        </p>

        <h2 className="font-serif text-xl font-bold mt-8">なぜニッチ食材？</h2>
        <p className="text-base leading-relaxed">
          サフラン、ポルチーニ、コールラビ、ムカゴ——名前は聞いたことがあるけど、
          使い方がわからない。そんな食材たちに光を当て、家庭でも気軽に楽しめる
          レシピをお届けします。
        </p>

        <h2 className="font-serif text-xl font-bold mt-8">私たちのこだわり</h2>
        <ul className="list-disc pl-6 space-y-2 text-base leading-relaxed">
          <li>プロの調理技術に基づいた丁寧なレシピ解説</li>
          <li>食材の背景（産地、旬、保存法）まで網羅した食材図鑑</li>
          <li>分量調整機能で人数に合わせた材料計算</li>
          <li>ステップごとの写真付き手順で失敗しない</li>
        </ul>

        <h2 className="font-serif text-xl font-bold mt-8">お問い合わせ</h2>
        <p className="text-base leading-relaxed">
          レシピのリクエストや掲載に関するお問い合わせは、
          SNSのダイレクトメッセージからお気軽にどうぞ。
        </p>
      </article>
    </div>
  )
}
