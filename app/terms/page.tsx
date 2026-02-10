import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "利用規約 | Matri-X",
  description: "Matri-X（matri-x-algo.wiki）の利用規約です。",
};

export default function TermsPage() {
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
          利用規約
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          最終更新日: 2026年2月10日
        </p>

        <div className="mt-10 space-y-10 text-[15px] leading-relaxed text-foreground/90">
          {/* 第1条 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              第1条（適用）
            </h2>
            <div className="mt-3 space-y-2">
              <p>
                本利用規約（以下「本規約」）は、Matri-X（以下「本サービス」）の利用に関する条件を、本サービスを利用するすべてのユーザー（以下「ユーザー」）と本サービスの運営者（以下「運営者」）との間で定めるものです。
              </p>
              <p>
                ユーザーは、本サービスを利用することにより、本規約に同意したものとみなされます。
              </p>
            </div>
          </section>

          {/* 第2条 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              第2条（本サービスの内容）
            </h2>
            <div className="mt-3 space-y-2">
              <p>
                本サービスは、X（旧Twitter）の推薦アルゴリズムに関する情報を解説・可視化するWebプラットフォームです。主に以下の機能を提供します。
              </p>
              <ul className="ml-5 list-disc space-y-1 text-foreground/80">
                <li>アルゴリズムのパイプライン解説・可視化</li>
                <li>エンゲージメント重み付けの分析</li>
                <li>TweepCredシミュレーター等の各種ツール</li>
                <li>AI検索機能</li>
                <li>ユーザー間のフォーラム（コミュニティ）機能</li>
                <li>その他関連する情報提供・学習コンテンツ</li>
              </ul>
            </div>
          </section>

          {/* 第3条 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              第3条（会員登録）
            </h2>
            <div className="mt-3 space-y-2">
              <p>
                本サービスの一部機能を利用するためには、会員登録が必要です。会員登録を希望する方は、運営者が定める方法により登録手続きを行うものとします。
              </p>
              <p>
                登録にあたり、以下の事項に該当する場合、運営者は登録を拒否することがあります。
              </p>
              <ul className="ml-5 list-disc space-y-1 text-foreground/80">
                <li>虚偽の情報を申告した場合</li>
                <li>過去に本規約に違反したことがある場合</li>
                <li>その他、運営者が不適切と判断した場合</li>
              </ul>
            </div>
          </section>

          {/* 第4条 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              第4条（アカウントの管理）
            </h2>
            <div className="mt-3 space-y-2">
              <p>
                ユーザーは、自己の責任においてアカウント情報（メールアドレス、パスワード等）を適切に管理するものとします。
              </p>
              <p>
                アカウントの不正使用により生じた損害について、運営者は一切の責任を負いません。アカウントの第三者への譲渡、貸与、共有は禁止します。
              </p>
            </div>
          </section>

          {/* 第5条 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              第5条（禁止事項）
            </h2>
            <div className="mt-3 space-y-2">
              <p>
                ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。
              </p>
              <ul className="ml-5 list-disc space-y-1 text-foreground/80">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>
                  本サービスのサーバーまたはネットワークに過度な負荷をかける行為
                </li>
                <li>本サービスの運営を妨害する行為</li>
                <li>他のユーザーの個人情報を不正に収集または蓄積する行為</li>
                <li>他のユーザーに対する誹謗中傷、嫌がらせ、脅迫行為</li>
                <li>
                  本サービスのコンテンツを無断で複製、転載、二次配布する行為
                </li>
                <li>
                  不正アクセス、リバースエンジニアリング、スクレイピング等の行為
                </li>
                <li>フォーラムにおけるスパム投稿や宣伝目的の投稿</li>
                <li>
                  本サービスで得た情報を、誤解を招く形で第三者に提供する行為
                </li>
                <li>その他、運営者が不適切と判断する行為</li>
              </ul>
            </div>
          </section>

          {/* 第6条 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              第6条（コンテンツの取扱い）
            </h2>
            <div className="mt-3 space-y-2">
              <p>
                ユーザーがフォーラム等に投稿したコンテンツ（テキスト、画像等）の著作権はユーザーに帰属しますが、運営者は本サービスの運営・改善に必要な範囲で当該コンテンツを利用できるものとします。
              </p>
              <p>
                運営者は、ユーザーの投稿が本規約に違反すると判断した場合、事前の通知なく当該投稿を削除できるものとします。
              </p>
            </div>
          </section>

          {/* 第7条 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              第7条（知的財産権）
            </h2>
            <div className="mt-3 space-y-2">
              <p>
                本サービスに掲載されているコンテンツ（テキスト、画像、デザイン、ソフトウェア、データ等）に関する知的財産権は、運営者または正当な権利者に帰属します。
              </p>
              <p>
                本サービスは、X（旧Twitter）が公開したオープンソースコードに基づく解説を提供していますが、X社とは一切関係がありません。X、Twitter等の商標はそれぞれの権利者に帰属します。
              </p>
            </div>
          </section>

          {/* 第8条 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              第8条（免責事項）
            </h2>
            <div className="mt-3 space-y-2">
              <p>
                本サービスで提供される情報は、X（旧Twitter）が公開したソースコードに基づく解説・分析であり、現在のXの実際のアルゴリズムと異なる場合があります。
              </p>
              <p>
                運営者は、本サービスの情報の正確性、完全性、有用性について保証するものではありません。本サービスの情報に基づいて行ったユーザーの行動により生じた結果について、運営者は一切の責任を負いません。
              </p>
              <p>
                運営者は、以下の事項について一切の責任を負わないものとします。
              </p>
              <ul className="ml-5 list-disc space-y-1 text-foreground/80">
                <li>本サービスの中断、停止、終了</li>
                <li>
                  本サービスの利用によるデータの消失、機器の故障等の損害
                </li>
                <li>ユーザー間のトラブル</li>
                <li>
                  本サービスの情報を利用した結果生じるXアカウントへの影響
                </li>
              </ul>
            </div>
          </section>

          {/* 第9条 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              第9条（サービスの変更・中断・終了）
            </h2>
            <div className="mt-3 space-y-2">
              <p>
                運営者は、ユーザーへの事前の通知なく、本サービスの内容を変更、または本サービスの提供を中断・終了することができるものとします。
              </p>
              <p>
                これによりユーザーに生じた損害について、運営者は一切の責任を負いません。
              </p>
            </div>
          </section>

          {/* 第10条 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              第10条（退会）
            </h2>
            <div className="mt-3 space-y-2">
              <p>
                ユーザーは、運営者が定める手続きにより、いつでも退会することができます。退会した場合、アカウントに関連するデータは運営者の判断により削除されることがあります。
              </p>
            </div>
          </section>

          {/* 第11条 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              第11条（利用制限および登録抹消）
            </h2>
            <div className="mt-3 space-y-2">
              <p>
                運営者は、ユーザーが本規約に違反した場合、事前の通知なく当該ユーザーの利用を制限し、またはアカウントを削除することができるものとします。
              </p>
            </div>
          </section>

          {/* 第12条 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              第12条（本規約の変更）
            </h2>
            <div className="mt-3 space-y-2">
              <p>
                運営者は、必要に応じて本規約を変更することができます。変更後の利用規約は、本サービス上に掲載した時点から効力を生じるものとします。
              </p>
              <p>
                変更後にユーザーが本サービスを利用した場合、変更後の規約に同意したものとみなします。
              </p>
            </div>
          </section>

          {/* 第13条 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              第13条（準拠法・管轄裁判所）
            </h2>
            <div className="mt-3 space-y-2">
              <p>本規約の解釈は、日本法に準拠するものとします。</p>
              <p>
                本サービスに関する紛争については、運営者の所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。
              </p>
            </div>
          </section>

          {/* お問い合わせ */}
          <section className="rounded-xl border border-border bg-card/50 p-6">
            <h2 className="text-lg font-semibold text-foreground">
              お問い合わせ
            </h2>
            <p className="mt-3">
              本規約に関するお問い合わせは、以下のフォームよりお願いいたします。
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
