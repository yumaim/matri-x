import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "プライバシーポリシー | Matri-X",
  description: "Matri-X（matri-x-algo.wiki）のプライバシーポリシーです。",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-xl font-bold text-gradient">
            Matri-X
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            ホームに戻る
          </Link>
        </div>
      </header>

      {/* Content */}
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          プライバシーポリシー
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          最終更新日: 2026年2月10日
        </p>

        <div className="mt-10 space-y-10 text-[15px] leading-relaxed text-foreground/90">
          {/* はじめに */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              はじめに
            </h2>
            <div className="mt-3 space-y-2">
              <p>
                Matri-X（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。本プライバシーポリシー（以下「本ポリシー」）は、本サービスにおける個人情報の取扱いについて定めるものです。
              </p>
              <p>
                ユーザーは、本サービスを利用することにより、本ポリシーに同意したものとみなされます。
              </p>
            </div>
          </section>

          {/* 収集する情報 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              1. 収集する情報
            </h2>
            <div className="mt-3 space-y-3">
              <p>本サービスでは、以下の情報を収集することがあります。</p>

              <div>
                <h3 className="font-medium text-foreground">
                  1.1 ユーザーが提供する情報
                </h3>
                <ul className="mt-2 ml-5 list-disc space-y-1 text-foreground/80">
                  <li>メールアドレス</li>
                  <li>
                    アカウント情報（表示名、プロフィール画像等）
                  </li>
                  <li>
                    Google OAuth認証を通じて取得する情報（Googleアカウントの名前、メールアドレス、プロフィール画像）
                  </li>
                  <li>フォーラムへの投稿内容</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-foreground">
                  1.2 自動的に収集される情報
                </h3>
                <ul className="mt-2 ml-5 list-disc space-y-1 text-foreground/80">
                  <li>
                    利用履歴（アクセスしたページ、利用した機能、閲覧日時等）
                  </li>
                  <li>
                    デバイス情報（ブラウザの種類、OS、画面解像度等）
                  </li>
                  <li>IPアドレス</li>
                  <li>Cookie情報</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 利用目的 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              2. 情報の利用目的
            </h2>
            <div className="mt-3 space-y-2">
              <p>収集した情報は、以下の目的で利用します。</p>
              <ul className="ml-5 list-disc space-y-1 text-foreground/80">
                <li>本サービスの提供・運営・改善</li>
                <li>ユーザー認証およびアカウント管理</li>
                <li>ユーザーサポートへの対応</li>
                <li>利用状況の分析およびサービス改善</li>
                <li>不正利用の防止およびセキュリティの確保</li>
                <li>
                  本サービスに関する重要なお知らせの送信
                </li>
                <li>利用規約への違反行為への対応</li>
              </ul>
            </div>
          </section>

          {/* Cookie */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              3. Cookieの使用
            </h2>
            <div className="mt-3 space-y-2">
              <p>
                本サービスでは、ユーザー体験の向上およびサービスの改善のためにCookieを使用しています。Cookieは以下の目的で使用されます。
              </p>
              <ul className="ml-5 list-disc space-y-1 text-foreground/80">
                <li>
                  セッション管理（ログイン状態の維持等）
                </li>
                <li>ユーザー設定の保存</li>
                <li>利用状況の分析</li>
              </ul>
              <p>
                ユーザーは、ブラウザの設定によりCookieの受け入れを拒否することができますが、その場合、本サービスの一部機能が正常に動作しない場合があります。
              </p>
            </div>
          </section>

          {/* 第三者サービス */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              4. 第三者サービスの利用
            </h2>
            <div className="mt-3 space-y-3">
              <p>
                本サービスでは、以下の第三者サービスを利用しています。各サービスにおける個人情報の取扱いについては、各サービスのプライバシーポリシーをご確認ください。
              </p>

              <div>
                <h3 className="font-medium text-foreground">
                  4.1 Google OAuth認証
                </h3>
                <p className="mt-1 text-foreground/80">
                  ユーザー認証のためにGoogle
                  OAuthを利用しています。Google認証を通じて、Googleアカウントの名前、メールアドレス、プロフィール画像を取得します。これらの情報はアカウント作成・ログインの目的でのみ使用されます。
                </p>
                <p className="mt-1">
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    Google プライバシーポリシー
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* 情報の共有 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              5. 情報の第三者への提供
            </h2>
            <div className="mt-3 space-y-2">
              <p>
                運営者は、以下の場合を除き、ユーザーの個人情報を第三者に提供しません。
              </p>
              <ul className="ml-5 list-disc space-y-1 text-foreground/80">
                <li>ユーザーの同意がある場合</li>
                <li>
                  法令に基づく場合（裁判所の命令、捜査機関の要請等）
                </li>
                <li>
                  人の生命、身体または財産の保護のために必要な場合
                </li>
                <li>
                  本サービスの運営に必要な範囲で業務委託先に提供する場合（適切な管理を条件とします）
                </li>
              </ul>
            </div>
          </section>

          {/* 情報の保管 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              6. 情報の保管とセキュリティ
            </h2>
            <div className="mt-3 space-y-2">
              <p>
                運営者は、収集した個人情報の漏洩、紛失、毀損を防止するため、適切なセキュリティ対策を講じます。
              </p>
              <p>
                ただし、インターネット上の通信において完全なセキュリティを保証することはできません。
              </p>
            </div>
          </section>

          {/* ユーザーの権利 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              7. ユーザーの権利
            </h2>
            <div className="mt-3 space-y-2">
              <p>
                ユーザーは、運営者に対して以下の請求を行うことができます。
              </p>
              <ul className="ml-5 list-disc space-y-1 text-foreground/80">
                <li>
                  自己の個人情報の開示、訂正、追加、削除の請求
                </li>
                <li>個人情報の利用停止の請求</li>
                <li>アカウントの削除（退会）の請求</li>
              </ul>
              <p>
                これらの請求は、下記のお問い合わせフォームよりご連絡ください。
              </p>
            </div>
          </section>

          {/* 未成年 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              8. 未成年者の利用
            </h2>
            <div className="mt-3 space-y-2">
              <p>
                未成年者が本サービスを利用する場合は、保護者の同意を得た上でご利用ください。
              </p>
            </div>
          </section>

          {/* ポリシーの変更 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              9. 本ポリシーの変更
            </h2>
            <div className="mt-3 space-y-2">
              <p>
                運営者は、必要に応じて本ポリシーを変更することがあります。変更後のプライバシーポリシーは、本サービス上に掲載した時点から効力を生じるものとします。
              </p>
              <p>
                重要な変更がある場合は、本サービス上で通知いたします。
              </p>
            </div>
          </section>

          {/* お問い合わせ */}
          <section className="rounded-xl border border-border bg-card/50 p-6">
            <h2 className="text-lg font-semibold text-foreground">
              お問い合わせ
            </h2>
            <p className="mt-3">
              本ポリシーに関するお問い合わせは、以下のフォームよりお願いいたします。
            </p>
            <p className="mt-2">
              <a
                href="https://tally.so/r/wA6o1z"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                お問い合わせフォーム
              </a>
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
