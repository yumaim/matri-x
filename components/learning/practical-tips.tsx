"use client";

import { Lightbulb, TrendingUp, Target, Zap, Users, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PracticalTip {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionable: string[];
  color: string;
  bgColor: string;
}

interface PracticalTipsProps {
  tips: PracticalTip[];
  title?: string;
  description?: string;
}

export function PracticalTips({
  tips,
  title = "💡 実運用への示唆",
  description = "このアルゴリズムを理解して、実際のX運用に活かすためのヒント",
}: PracticalTipsProps) {
  return (
    <Card className="glass border-border/30 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-4 sm:px-6 py-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30">
            <Lightbulb className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm sm:text-base">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
      </div>
      <CardContent className="p-4 sm:p-6">
        <div className="grid gap-4 sm:gap-5">
          {tips.map((tip, idx) => (
            <TipCard key={idx} tip={tip} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TipCard({ tip }: { tip: PracticalTip }) {
  const Icon = tip.icon;
  return (
    <div
      className={cn(
        "rounded-lg border p-4 sm:p-5 transition-all hover:shadow-md",
        tip.bgColor
      )}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg shrink-0 mt-0.5",
            tip.color
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={cn("font-semibold text-sm sm:text-base", tip.color.replace("bg-", "text-"))}>{tip.title}</h4>
        </div>
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3">
        {tip.description}
      </p>
      <div className="space-y-2">
        <div className="text-xs font-semibold text-foreground/80">✅ 具体的なアクション:</div>
        <ul className="space-y-1.5">
          {tip.actionable.map((action, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
              <span className="text-primary shrink-0 mt-0.5">•</span>
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// よく使うTipsのプリセット
export const phoenixTips: PracticalTip[] = [
  {
    icon: Target,
    title: "初速30分が全て",
    description:
      "Phoenixは初速30分のエンゲージメントを最重視します。Transformerが「このツイートは拡散される」と判断すると、Out-of-Network（フォロー外）にも積極的に配信されます。",
    actionable: [
      "投稿直後にコアなフォロワーがリプライ・リポストする仕組みを作る（Discord通知等）",
      "最初の30分で「いいね」よりも「リプライ」を狙う（エンゲージメント係数が高い）",
      "投稿時間をフォロワーが最もアクティブな時間帯に合わせる",
    ],
    color: "bg-blue-500/20",
    bgColor: "bg-blue-500/5 border-blue-500/20",
  },
  {
    icon: MessageCircle,
    title: "リプライの質を最大化",
    description:
      "Phoenixは「reply_engaged_by_author（投稿者が返信したリプライ）」を最高評価します。単なるリプライではなく、投稿者とのやり取りが発生するツイートが爆発的に伸びます。",
    actionable: [
      "質問形式のツイートで、リプライを誘発する（「あなたはどう思いますか？」等）",
      "コメントには必ず返信する（Phoenixがあなたのengagement率を学習）",
      "初期リプライは自分で「種まき」する（議論のきっかけを作る）",
    ],
    color: "bg-emerald-500/20",
    bgColor: "bg-emerald-500/5 border-emerald-500/20",
  },
  {
    icon: Users,
    title: "Out-of-Networkを狙う",
    description:
      "Two-Tower Modelは、あなたのツイートを「似た興味を持つフォロー外ユーザー」に届けます。フォロワー数が少なくても、特定のトピックで強い反応があれば爆発的に拡散されます。",
    actionable: [
      "ニッチなトピックで専門性を出す（「〇〇といえばこの人」を目指す）",
      "トレンドワードを狙うのではなく、「このトピックに興味がある人」を狙う",
      "初速30分で同じトピックに興味がある人（フォロー外）からのエンゲージメントを集める",
    ],
    color: "bg-purple-500/20",
    bgColor: "bg-purple-500/5 border-purple-500/20",
  },
  {
    icon: Zap,
    title: "Candidate Isolationを理解する",
    description:
      "新アルゴリズムは候補を独立して評価するため、「他の投稿と比較して勝つ」必要がありません。常に高品質なツイートをすれば、フォロワーのタイムラインに必ず表示されます。",
    actionable: [
      "無理に毎日投稿せず、質の高いツイートだけを出す（スコアは独立評価）",
      "過去の投稿実績（エンゲージメント率）がTransformerに学習されるため、一貫性を保つ",
      "低品質な投稿は「あなたの平均スコア」を下げるため、投稿しない方が良い",
    ],
    color: "bg-orange-500/20",
    bgColor: "bg-orange-500/5 border-orange-500/20",
  },
];

export const thunderTips: PracticalTip[] = [
  {
    icon: TrendingUp,
    title: "フォロワーのアクティブ時間を把握",
    description:
      "Thunderは超高速でIn-Network（フォロー中）のツイートを取得しますが、タイムラインの上位に表示されるかはPhoenixのスコアリング次第。フォロワーがアクティブな時間に投稿することで、初速を最大化できます。",
    actionable: [
      "Analyticsでフォロワーの最もアクティブな時間帯を確認",
      "その時間帯の30分前に投稿（フィードに新鮮な状態で表示される）",
      "週末vs平日、朝vs夜でエンゲージメント率を比較してパターンを見つける",
    ],
    color: "bg-cyan-500/20",
    bgColor: "bg-cyan-500/5 border-cyan-500/20",
  },
  {
    icon: Zap,
    title: "削除ツイートは即座に反映される",
    description:
      "Thunderはリアルタイムで削除イベントを反映します。旧システムではバッチ処理だったため、削除してもしばらく表示されていましたが、今は即座に消えます。誤投稿は早めに削除すれば影響を最小化できます。",
    actionable: [
      "誤字・誤情報に気づいたら即座に削除→訂正ツイートを投稿",
      "削除後のスコアへの影響は最小限（旧システムよりリカバリーしやすい）",
      "ただし、頻繁な削除は「低品質アカウント」と学習される可能性あり",
    ],
    color: "bg-red-500/20",
    bgColor: "bg-red-500/5 border-red-500/20",
  },
];

export const comparisonTips: PracticalTip[] = [
  {
    icon: Target,
    title: "手動特徴量 → 自動学習の意味",
    description:
      "旧システムは「reply_weight=75.0」のような固定値でしたが、新システムはTransformerが文脈から動的に判断します。つまり、「どんなツイートか」ではなく「このユーザーにとってどんな価値があるか」で評価されます。",
    actionable: [
      "万人受けを狙わず、特定のペルソナ（ターゲット層）に刺さるツイートを作る",
      "あなたのフォロワーが「過去にエンゲージした内容」に近いトピックで投稿",
      "A/Bテストで「どのトピックが最もエンゲージされるか」を継続的に検証",
    ],
    color: "bg-violet-500/20",
    bgColor: "bg-violet-500/5 border-violet-500/20",
  },
  {
    icon: Users,
    title: "SimClusters → Two-Towerの変化",
    description:
      "旧システムは145,000の固定コミュニティでしたが、新システムはニューラル検索で「似たユーザー」を動的に見つけます。つまり、あなたのツイートがどのクラスタに届くかは、リアルタイムで変化します。",
    actionable: [
      "特定のクラスタ（コミュニティ）に固執せず、トピックごとに最適化",
      "新しいトピックに挑戦しても、Two-Towerが適切なユーザーに届けてくれる",
      "過去のエンゲージメント履歴がTransformerに学習されるため、一貫性は重要",
    ],
    color: "bg-indigo-500/20",
    bgColor: "bg-indigo-500/5 border-indigo-500/20",
  },
];
