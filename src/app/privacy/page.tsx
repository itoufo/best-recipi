import type { Metadata } from 'next'
import { SITE } from '@/lib/constants/site'
import { Breadcrumb } from '@/components/layout/breadcrumb'

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description: `${SITE.name}のプライバシーポリシー。個人情報の取り扱い、Cookie、広告について。`,
  alternates: { canonical: `${SITE.url}/privacy` },
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Breadcrumb items={[
        { label: 'ホーム', href: '/' },
        { label: 'プライバシーポリシー' },
      ]} />

      <article className="mt-4 space-y-6">
        <h1 className="font-serif text-3xl font-bold">プライバシーポリシー</h1>

        <p className="text-sm text-muted-foreground">最終更新日: 2026年3月1日</p>

        <h2 className="font-serif text-xl font-bold mt-8">1. 個人情報の収集</h2>
        <p className="text-base leading-relaxed">
          当サイトでは、アクセス解析のためにGoogle Analyticsを使用しています。
          Google Analyticsはトラフィックデータの収集のためにCookieを使用しています。
          このトラフィックデータは匿名で収集されており、個人を特定するものではありません。
        </p>

        <h2 className="font-serif text-xl font-bold mt-8">2. 広告について</h2>
        <p className="text-base leading-relaxed">
          当サイトでは、Google AdSenseによる広告配信を行っています。
          Google AdSenseは、ユーザーの興味に基づく広告を表示するためにCookieを使用することがあります。
        </p>

        <h2 className="font-serif text-xl font-bold mt-8">3. アフィリエイトプログラム</h2>
        <p className="text-base leading-relaxed">
          当サイトは、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を
          提供することを目的に設定されたアフィリエイトプログラムである、
          Amazonアソシエイト・プログラムの参加者です。
          また、楽天アフィリエイトプログラムにも参加しています。
        </p>

        <h2 className="font-serif text-xl font-bold mt-8">4. Cookieについて</h2>
        <p className="text-base leading-relaxed">
          当サイトでは、上記の広告配信やアクセス解析のためにCookieを使用しています。
          ブラウザの設定によりCookieの受け取りを拒否することも可能です。
        </p>

        <h2 className="font-serif text-xl font-bold mt-8">5. 免責事項</h2>
        <p className="text-base leading-relaxed">
          当サイトに掲載されている情報の正確さについて万全を期しておりますが、
          その内容について保証するものではありません。
          レシピの実践により生じたいかなる損害についても、責任を負いかねます。
        </p>
      </article>
    </div>
  )
}
