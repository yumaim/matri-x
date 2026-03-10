import Link from "next/link";
import { LPHeader } from "@/components/lp/lp-header";
import {
  ChevronDown,
  ArrowRight,
  HelpCircle,
  Shield,
  CreditCard,
  Zap,
  Users,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "よくある質問 (FAQ) | Matri-X",
  description:
    "Matri-Xに関するよくある質問をまとめています。アカウント、料金プラン、セキュリティ、機能についてご確認ください。",
};

const faqCategories = [
  {
    name: "はじめに",
    icon: BookOpen,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    questions: [
      {
        q: "Matri-Xとは何ですか？",
        a: "Matri-Xは、X（旧Twitter）の推薦アルゴリズムをソースコードレベルで解析し、可視化・学習できる専門プラットフォームです。エンゲージメントの重み付け、パイプラインの仕組み、Trust & Safetyのロジックなどを深く理解できます。",
      },
      {
        q: "どのような人向けのサービスですか？",
        a: "SNSマーケター、インフルエンサー、X運用代行会社、広告代理店、D2Cブランドのソーシャルメディア担当者など、Xアルゴリズムを正しく理解して戦略的に活用したいすべての方が対象です。",
      },
      {
        q: "アカウント作成にはどうすればいいですか？",
        a: "現在は招待制で運営しています。招待コードをお持ちの方は、登録ページからコードを入力してアカウントを作成できます。招待コードのお問い合わせは公式Xアカウント(@hubz_yuma)までご連絡ください。",
      },
      {
        q: "無料で利用できますか？",
        a: "はい、現在はFreeプランで全機能を無料でお試しいただけます。今後、Standard (¥2,980/月) とPro (¥5,980/月) の有料プランを提供予定です。",
      },
    ],
  },
  {
    name: "機能・使い方",
    icon: Zap,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    questions: [
      {
        q: "パイプライン探索とは何ですか？",
        a: "Xのタイムライン生成プロセス（候補取得→ランキング→フィルタリング→配信）を段階的に可視化する機能です。約1,400件の候補から最終50件がどのように選ばれるかを理解できます。",
      },
      {
        q: "エンゲージメントの重みはどうやって決まりますか？",
        a: "Xのソースコードに基づいています。例えばリプライ+著者返信は75.0倍、リプライ単独は13.5倍、リポストは1.0倍、いいねは0.5倍です。これらの数値はソースコードから直接抽出されたものです。",
      },
      {
        q: "TweepCredシミュレーターとは何ですか？",
        a: "あなたのXアカウントの「信頼度スコア」をシミュレーションするツールです。フォロワー数、フォロー比率、アカウント年齢などの要素から、アルゴリズムがあなたのアカウントをどう評価するかを予測します。",
      },
      {
        q: "Deep AI検索はどう使えますか？",
        a: "アルゴリズムに関する疑問をAIに質問できます。例えば「動画投稿のブースト率は？」と聞くと、ソースコードに基づいた回答を返します。Pro プラン以上で無制限にご利用いただけます。",
      },
      {
        q: "学習コンテンツはどのような内容ですか？",
        a: "推薦パイプライン、Heavy Ranker、SimClusters、Grok統合など、Xアルゴリズムの各要素を段階的に学べるステップバイステップのチュートリアルです。学習進捗はダッシュボードで確認できます。",
      },
    ],
  },
  {
    name: "料金プラン",
    icon: CreditCard,
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    questions: [
      {
        q: "現在の料金体系を教えてください。",
        a: "現在は3つのプランを予定しています：Free (¥0、基本機能)、Standard (¥2,980/月、シミュレーター・フォーラム)、Pro (¥5,980/月、DeepWiki AI・週次レポート・全機能)。Enterprise プランはチーム向けにカスタム対応です。",
      },
      {
        q: "年額払いの割引はありますか？",
        a: "はい、年額プランでは20%割引を予定しています。Standard 年額 ¥28,608 (月あたり ¥2,384)、Pro 年額 ¥57,408 (月あたり ¥4,784) です。",
      },
      {
        q: "プランの変更やキャンセルはできますか？",
        a: "はい、いつでもプランの変更・キャンセルが可能です。ダウングレードは次の請求サイクルから反映され、アップグレードは即座に適用されます。",
      },
      {
        q: "法人・チームでの利用は可能ですか？",
        a: "はい、Enterprise プランでチームライセンス、API アクセス、専属サポートをご提供します。お問い合わせフォームよりご連絡ください。",
      },
    ],
  },
  {
    name: "セキュリティ・プライバシー",
    icon: Shield,
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    questions: [
      {
        q: "個人情報はどのように保護されていますか？",
        a: "パスワードはbcryptで12ラウンドのハッシュ化、通信はSSL/TLS暗号化、データはSupabase(PostgreSQL)で安全に保管しています。詳細はプライバシーポリシーをご確認ください。",
      },
      {
        q: "Xアカウントの認証情報は必要ですか？",
        a: "いいえ、MatriXではXアカウントへのログインやAPI連携は一切行いません。シミュレーターは仮想的な数値で計算するため、実際のX認証情報は不要です。",
      },
      {
        q: "データの取得元は何ですか？",
        a: "Xのオープンソースアルゴリズム（GitHub公開分）とその後の研究論文・公式発表に基づいています。ユーザーの非公開データへのアクセスは一切行いません。",
      },
    ],
  },
  {
    name: "コミュニティ",
    icon: Users,
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
    questions: [
      {
        q: "フォーラムではどんな活動ができますか？",
        a: "アルゴリズムの検証結果、戦略ディスカッション、質問投稿ができます。投稿やコメントでXPが貯まり、レベルアップやアチーブメントの解除も楽しめます。",
      },
      {
        q: "Discordコミュニティはありますか？",
        a: "専用のDiscordサーバーを準備中です。リアルタイムでのアルゴリズム速報、メンバー同士の交流、Pro会員限定チャネルなどを提供予定です。",
      },
      {
        q: "法人パートナーとして参加できますか？",
        a: "はい、2つの協業プランをご用意しています。ホワイトラベルOEMプラン（レベニューシェア40%）またはアフィリエイトプラン（レベニューシェア30%）からお選びいただけます。詳細はお問い合わせください。",
      },
    ],
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-xl border border-border bg-card/50 transition-all hover:border-primary/30 [&[open]]:border-primary/20 [&[open]]:bg-primary/5">
      <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-foreground list-none [&::-webkit-details-marker]:hidden">
        <span className="flex-1">{question}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="px-5 pb-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {answer}
        </p>
      </div>
    </details>
  );
}

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-background">
      <LPHeader />

      {/* Hero */}
      <section className="relative pt-24 sm:pt-32 pb-12">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/15 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-accent/15 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 backdrop-blur-sm">
            <HelpCircle className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              ヘルプセンター
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-gradient">よくある質問</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Matri-Xに関する疑問にお答えします
          </p>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
          {faqCategories.map((category) => (
            <div key={category.name}>
              <div className="flex items-center gap-3 mb-5">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${category.bgColor}`}
                >
                  <category.icon className={`h-5 w-5 ${category.color}`} />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  {category.name}
                </h2>
              </div>
              <div className="space-y-2">
                {category.questions.map((item) => (
                  <FAQItem
                    key={item.q}
                    question={item.q}
                    answer={item.a}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-3xl p-8 sm:p-12 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              まだ疑問が解決しませんか？
            </h2>
            <p className="mt-3 text-muted-foreground">
              お気軽にお問い合わせください。
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="https://tally.so/r/wA6o1z" target="_blank" rel="noopener noreferrer">
                  お問い合わせ
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="https://x.com/hubz_yuma" target="_blank" rel="noopener noreferrer">
                  X で質問する
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <span className="text-lg font-bold text-gradient">Matri-X</span>
            <div className="flex items-center gap-4">
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                利用規約
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                プライバシー
              </Link>
              <Link
                href="https://tally.so/r/wA6o1z"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                お問い合わせ
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            &copy; 2026 Matri-X. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
