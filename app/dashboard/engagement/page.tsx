"use client";

import {
  MessageSquare,
  Heart,
  Repeat2,
  Users,
  Eye,
  Clock,
  Video,
  ImageIcon,
  FileText,
  Link2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink,
  Zap,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts";
import { cn } from "@/lib/utils";

const engagementWeights = [
  {
    action: "リプライ + 著者が返信",
    weight: 75.0,
    icon: MessageSquare,
    color: "#1d9bf0",
    description: "双方向会話が最も高く評価。リプライに著者が返信すると発動。いいねの150倍",
  },
  {
    action: "リプライ",
    weight: 13.5,
    icon: MessageSquare,
    color: "#1d9bf0",
    description: "リプライ単体でもいいねの27倍の重み",
  },
  {
    action: "プロフィール訪問→いいね/リプ",
    weight: 12.0,
    icon: Users,
    color: "#7856ff",
    description: "プロフィールを開いてからいいねやリプライした場合",
  },
  {
    action: "会話クリック→リプ/いいね",
    weight: 11.0,
    icon: Eye,
    color: "#ff7a00",
    description: "会話スレッドに入ってからエンゲージした場合",
  },
  {
    action: "会話クリック→2分以上滞在",
    weight: 10.0,
    icon: Clock,
    color: "#ff7a00",
    description: "会話スレッドに2分以上滞在。深い関心の指標",
  },
  {
    action: "リポスト",
    weight: 1.0,
    icon: Repeat2,
    color: "#00ba7c",
    description: "リポスト（リツイート）。拡散シグナル",
  },
  {
    action: "いいね",
    weight: 0.5,
    icon: Heart,
    color: "#f91880",
    description: "最も弱いポジティブシグナル。多くのSNSコンサルが過大評価",
  },
  {
    action: "動画50%以上視聴",
    weight: 0.005,
    icon: Video,
    color: "#7856ff",
    description: "動画の50%以上を視聴。重みは極めて小さいが計測される",
  },
];

const negativeWeights = [
  {
    action: "スパム報告",
    weight: -369.0,
    icon: AlertTriangle,
    color: "#ff0000",
    description: "最大ペナルティ。いいね738個分のマイナス。1件で壊滅的ダメージ",
  },
  {
    action: "興味なし / ミュート / ブロック",
    weight: -74.0,
    icon: AlertTriangle,
    color: "#ff6600",
    description: "「興味がない」表示、ミュート、ブロック。いいね148個分のマイナス",
  },
];

const SHORT_NAMES: Record<string, string> = {
  "リプライ + 著者が返信": "リプライ+返信",
  "リプライ": "リプライ",
  "プロフィール訪問→いいね/リプ": "プロフ→いいね/リプ",
  "会話クリック→リプ/いいね": "会話→リプ/いいね",
  "会話クリック→2分以上滞在": "滞在2分+",
  "リポスト": "リポスト",
  "いいね": "いいね",
  "動画50%以上視聴": "動画50%視聴",
};

const chartData = engagementWeights.map((item) => ({
  name: `${SHORT_NAMES[item.action] ?? item.action} ×${item.weight}`,
  weight: item.weight,
  fill: item.color,
}));

const negativeChartData = negativeWeights.map((item) => ({
  name: item.action,
  weight: Math.abs(item.weight),
  fill: item.color,
}));

const chartConfig = {
  weight: {
    label: "重み付け",
  },
};

const negativeChartConfig = {
  weight: {
    label: "ペナルティ",
  },
};

const mediaBoosts = [
  { type: "動画", icon: Video, boost: 3.0, color: "bg-primary", textColor: "text-primary" },
  { type: "画像", icon: ImageIcon, boost: 1.8, color: "bg-accent", textColor: "text-accent" },
  { type: "GIF", icon: FileText, boost: 1.5, color: "bg-[#00ba7c]", textColor: "text-[#00ba7c]" },
  { type: "リンク", icon: Link2, boost: 1.2, color: "bg-orange-500", textColor: "text-orange-500" },
  { type: "テキストのみ", icon: FileText, boost: 1.0, color: "bg-muted", textColor: "text-muted-foreground" },
];

const tips = [
  {
    title: "リプライを促す質問で締めくくる",
    description: "投稿の最後に質問を入れることで、リプライ(13.5x)を促進。著者が返信すれば75xに跳ね上がる",
    impact: "高",
  },
  {
    title: "投稿後30分が勝負",
    description: "リアルタイム特徴量の集計ウィンドウは30分。初速で全てが決まる",
    impact: "高",
  },
  {
    title: "全てのリプライに返信する",
    description: "75.0xの重み付けを活かした双方向コミュニケーション。いいね150個分",
    impact: "高",
  },
  {
    title: "スパム報告を絶対に避ける",
    description: "1件のスパム報告(-369.0)はいいね738個分を打ち消す。壊滅的ダメージ",
    impact: "高",
  },
  {
    title: "スレッド形式を活用",
    description: "滞在時間(10.0x)と会話クリック(11.0x)を同時に獲得",
    impact: "中",
  },
];

export default function EngagementPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          エンゲージメント重み付け
        </h1>
        <p className="mt-1 text-muted-foreground">
          Heavy Rankerの公式エンゲージメント重み付け — ソースコードから判明した実際の数値
        </p>
      </div>

      <Tabs defaultValue="weights" className="space-y-6">
        <TabsList className="glass w-full overflow-x-auto overflow-y-hidden flex justify-start sm:justify-center no-scrollbar" style={{ touchAction: "pan-x", overscrollBehavior: "contain" }}>
          <TabsTrigger value="weights" className="shrink-0">重み付け</TabsTrigger>
          <TabsTrigger value="negative" className="shrink-0">ネガティブシグナル</TabsTrigger>
          <TabsTrigger value="velocity" className="shrink-0">加速度</TabsTrigger>
          <TabsTrigger value="media" className="shrink-0">メディアブースト</TabsTrigger>
          <TabsTrigger value="tips">最適化Tips</TabsTrigger>
        </TabsList>

        {/* Weights Tab */}
        <TabsContent value="weights" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Chart */}
            <Card className="glass overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  エンゲージメント重み付けチャート
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[350px] w-full" style={{ maxWidth: "100%", overflow: "hidden", touchAction: "pan-x" }}>
                  <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                    <XAxis type="number" domain={[0, 80]} tickCount={5} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={70}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 8 }}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      cursor={{ fill: "hsl(var(--muted))" }}
                    />
                    <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Weight Details */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">重み付け詳細</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {engagementWeights.map((item) => (
                  <div
                    key={item.action}
                    className="flex items-start gap-4 rounded-lg bg-muted/50 p-4"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <item.icon
                        className="h-5 w-5"
                        style={{ color: item.color }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground">
                          {item.action}
                        </h4>
                        <span
                          className="text-lg font-bold"
                          style={{ color: item.color }}
                        >
                          ×{item.weight}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Important Note */}
          <Card className="glass border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Info className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    リプライ + 著者返信が最も重要
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    リプライに著者が返信した場合の重み(75.0x)は、いいね(0.5x)の<span className="font-bold text-primary">150倍</span>です。
                    リプライ単体(13.5x)でもいいねの27倍。一方、多くのSNSコンサルが重視する「いいね」は
                    実質的に最も弱いシグナル(0.5x)に過ぎません。
                    コンテンツ戦略では、リプライを促し、全てのリプライに返信することが最重要です。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Negative Signals Tab */}
        <TabsContent value="negative" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Negative Chart */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  ネガティブシグナル — ペナルティ規模
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={negativeChartConfig} className="h-[200px]" style={{ maxWidth: "100%", overflow: "hidden", touchAction: "pan-x" }}>
                  <BarChart data={negativeChartData} layout="vertical" margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={100}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      cursor={{ fill: "hsl(var(--muted))" }}
                    />
                    <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
                      {negativeChartData.map((entry, index) => (
                        <Cell key={`neg-cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Negative Weight Details */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">ネガティブシグナル詳細</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {negativeWeights.map((item) => (
                  <div
                    key={item.action}
                    className="rounded-xl border border-destructive/30 bg-destructive/5 p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        <item.icon
                          className="h-5 w-5"
                          style={{ color: item.color }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-foreground">
                            {item.action}
                          </h4>
                          <span
                            className="text-2xl font-bold"
                            style={{ color: item.color }}
                          >
                            ×{item.weight}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Comparison */}
          <Card className="glass border-orange-500/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-orange-500" />
                <div>
                  <h4 className="font-semibold text-foreground">
                    ペナルティの破壊力
                  </h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    スパム報告1件(<span className="font-bold text-red-500">-369.0</span>)を取り消すには、
                    いいね<span className="font-bold">738個</span>が必要。
                    「興味なし」1件(<span className="font-bold text-orange-500">-74.0</span>)にはいいね<span className="font-bold">148個</span>。
                    ネガティブシグナルはポジティブシグナルの数百倍のインパクトがあるため、
                    スパム的な行動やフォロワーを不快にさせるコンテンツは絶対に避けてください。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Velocity Tab */}
        <TabsContent value="velocity" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 30分ウィンドウ */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  投稿後30分のリアルタイム集計
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-4">
                  <h4 className="font-semibold text-foreground text-sm">author_aggregate real_time</h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Heavy Rankerは投稿後のエンゲージメントを<span className="font-bold text-yellow-500">リアルタイム集計ウィンドウ</span>で計測。
                    この集計は直近のエンゲージメント速度を捉える特徴量として使われます。
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="font-medium text-foreground text-sm">⏱️ 30分集計の仕組み</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      投稿後30分間のエンゲージメント（リプライ、いいね、リポスト等）がリアルタイムで集計され、
                      スコアリングに直接反映されます。この時間帯のパフォーマンスが初期配信範囲を決定します。
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="font-medium text-foreground text-sm">🚀 初速が全てを決める理由</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      初回配信のスコアが低いと、以降の配信対象が縮小。30分以内にリプライ(13.5x)や
                      著者返信(75.0x)を獲得できるかが、投稿のリーチを指数関数的に変える。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 加速度の概念 */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-accent" />
                  加速度 — バイラルの方程式
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl bg-accent/10 border border-accent/30 p-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">バイラル速度の定義</p>
                    <p className="text-xl font-mono font-bold text-accent">
                      velocity = ΔEngagement / Δtime
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="font-medium text-foreground text-sm">📈 velocityとは</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      単位時間あたりのエンゲージメント増加量。重み付きスコア(リプライ=13.5x, いいね=0.5x等)の
                      合計が短時間で急増すると、velocityが高くなります。
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="font-medium text-foreground text-sm">⚡ 加速度が高い投稿がバイラルになる仕組み</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      velocityが高い → 配信範囲が拡大 → さらにエンゲージメントが増加 → velocityがさらに上昇。
                      この正のフィードバックループが「バイラル」の正体。30分以内にリプライの連鎖を生み出すことが鍵。
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="font-medium text-foreground text-sm">🎯 実践的なアクション</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      投稿直後に自分からリプライに返信(75.0x)し、会話を生み出す。
                      フォロワーのアクティブ時間帯に投稿し、初速のリプライ数を最大化する。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Velocity Summary */}
          <Card className="glass border-yellow-500/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10">
                  <Zap className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    まとめ: 初速ウィンドウの正体
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    投稿の拡散力は<span className="font-bold text-yellow-500">初期エンゲージメントの集中度</span>で決まる。
                    ただし「30分」は<span className="font-bold text-orange-400">投稿時刻からの30分ではない</span>。
                    ソースコード上の30分ウィンドウは<span className="font-bold text-foreground">ローリング集計</span>で、
                    著者全体の直近30分のEGを見ている。
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    いいね(0.5x)を100個集めるより、リプライ+著者返信(75.0x)を2件獲得する方が3倍効果的。
                    <span className="font-bold text-primary">リプライの連鎖</span>を生み出し、
                    <span className="font-bold text-accent">velocity</span>を最大化することがバイラルへの道。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Note */}
          <Card className="glass border-orange-500/30 bg-orange-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    ⚠️ 「初速30分」の誤解に注意
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    ソースコードの <code className="text-xs bg-muted px-1 py-0.5 rounded">author_aggregate (real_time)</code> の
                    <span className="font-bold text-orange-500">30分ウィンドウはローリング集計</span>です。
                    「投稿してから30分間」ではなく、「<span className="font-bold text-foreground">直近30分間の著者全体のエンゲージメント</span>」を計測しています。
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    つまり、投稿直後ではなく<span className="font-bold text-foreground">エンゲージメントが集中し始めたタイミングからの30分</span>が重要。
                    Grok導入後は、投稿直後はGrokによる品質評価→初期配信判定が行われ、
                    エンゲージメントはその後の配信拡大フェーズで本格的に発生します。
                  </p>
                  <div className="mt-3 rounded-lg bg-muted/50 p-3">
                    <p className="text-xs font-mono text-muted-foreground">
                      投稿 → Grok品質評価 → 初期配信 → EG開始 → <span className="text-orange-500 font-bold">★ここからの30分ウィンドウが本番</span> → 加速度上昇 → 配信拡大
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Boost Tab */}
        <TabsContent value="media" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                メディアタイプ別ブースト係数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {mediaBoosts.map((media) => (
                  <div
                    key={media.type}
                    className="flex flex-col items-center rounded-xl bg-muted/50 p-6 text-center"
                  >
                    <div
                      className={cn(
                        "flex h-16 w-16 items-center justify-center rounded-xl",
                        media.color
                      )}
                    >
                      <media.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      {media.type}
                    </div>
                    <div className={cn("mt-1 text-3xl font-bold", media.textColor)}>
                      {media.boost}x
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl bg-primary/10 p-6">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    動画活用のベストプラクティス
                  </h4>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li>・最初の3秒で視聴者の注意を引く</li>
                    <li>・字幕を追加(85%が音声なしで視聴)</li>
                    <li>・縦型動画がモバイルで効果的</li>
                    <li>・15-60秒の長さが最適</li>
                  </ul>
                </div>
                <div className="rounded-xl bg-accent/10 p-6">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    画像活用のベストプラクティス
                  </h4>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li>・高品質な画像を使用(1200x675px推奨)</li>
                    <li>・テキストは画像の20%以下に抑える</li>
                    <li>・複数画像を活用(最大4枚)</li>
                    <li>・Alt textを必ず追加</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tips Tab */}
        <TabsContent value="tips" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[#00ba7c]" />
                エンゲージメント最適化Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-xl bg-muted/50 p-6"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-foreground">
                          {tip.title}
                        </h4>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            tip.impact === "高"
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          影響度: {tip.impact}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card className="glass border-[#00ba7c]/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#00ba7c]/10">
                  <TrendingUp className="h-6 w-6 text-[#00ba7c]" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    まとめ: エンゲージメント最大化の公式
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    <span className="font-semibold text-primary">質問で締めてリプライを促す</span> +{" "}
                    <span className="font-semibold text-accent">全てのリプライに著者返信(75.0x)</span> +{" "}
                    <span className="font-semibold text-yellow-500">投稿後30分以内に初速を最大化</span> ={" "}
                    <span className="font-bold text-foreground">最大エンゲージメント</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Source Code Reference — always visible */}
      <Card className="glass border-muted">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted">
              <ExternalLink className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                ソースコード出典
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                このページのエンゲージメント重み付けは、Xが公開したHeavy Rankerのソースコードに基づいています。
              </p>
              <div className="mt-3 space-y-1">
                <a
                  href="https://github.com/twitter/the-algorithm-ml/blob/main/projects/home/recap/README.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  twitter/the-algorithm-ml — projects/home/recap/README.md
                </a>
                <p className="text-xs text-muted-foreground">
                  scored_tweets_model_weight_* パラメータより抽出
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
