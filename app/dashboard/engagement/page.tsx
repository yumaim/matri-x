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
    action: "リプライ + 著者リプライ",
    weight: 150,
    icon: MessageSquare,
    color: "#1d9bf0",
    description: "双方向のコミュニケーションが最も高く評価される",
  },
  {
    action: "いいね",
    weight: 30,
    icon: Heart,
    color: "#f91880",
    description: "基本的なエンゲージメントシグナル",
  },
  {
    action: "リツイート",
    weight: 20,
    icon: Repeat2,
    color: "#00ba7c",
    description: "コンテンツの拡散に貢献",
  },
  {
    action: "プロフィールクリック",
    weight: 12,
    icon: Users,
    color: "#7856ff",
    description: "ユーザーへの興味を示す",
  },
  {
    action: "詳細表示",
    weight: 11,
    icon: Eye,
    color: "#f97316",
    description: "コンテンツへの関心を示す",
  },
  {
    action: "2分以上滞在",
    weight: 10,
    icon: Clock,
    color: "#06b6d4",
    description: "深いエンゲージメントの証拠",
  },
];

const chartData = engagementWeights.map((item) => ({
  name: item.action.replace(" + 著者リプライ", ""),
  weight: item.weight,
  fill: item.color,
}));

const chartConfig = {
  weight: {
    label: "重み付け",
  },
};

const mediaBoosts = [
  { type: "動画", icon: Video, boost: 3.0, color: "bg-primary", textColor: "text-primary" },
  { type: "画像", icon: ImageIcon, boost: 1.8, color: "bg-accent", textColor: "text-accent" },
  { type: "GIF", icon: FileText, boost: 1.5, color: "bg-[#00ba7c]", textColor: "text-[#00ba7c]" },
  { type: "リンク", icon: Link2, boost: 1.2, color: "bg-orange-500", textColor: "text-orange-500" },
  { type: "テキストのみ", icon: FileText, boost: 1.0, color: "bg-muted", textColor: "text-muted-foreground" },
];

const negativeSignals = [
  {
    action: "ミュート",
    impact: "-74x",
    description: "ユーザーがあなたをミュートした場合",
  },
  {
    action: "ブロック",
    impact: "-100x",
    description: "ユーザーがあなたをブロックした場合",
  },
  {
    action: "スパム報告",
    impact: "-200x",
    description: "スパムとして報告された場合",
  },
  {
    action: "フォロー解除後の非表示",
    impact: "-50x",
    description: "「この投稿を見せない」を選択された場合",
  },
];

const tips = [
  {
    title: "リプライを促す質問で締めくくる",
    description: "投稿の最後に質問を入れることで、リプライを促進",
    impact: "高",
  },
  {
    title: "動画コンテンツを活用",
    description: "3倍のブースト効果、最初の3秒が勝負",
    impact: "高",
  },
  {
    title: "著者リプライに返信する",
    description: "150xの重み付けを活かした双方向コミュニケーション",
    impact: "高",
  },
  {
    title: "投稿時間を最適化",
    description: "フォロワーのアクティブ時間帯に合わせる",
    impact: "中",
  },
  {
    title: "スレッド形式を活用",
    description: "滞在時間を増やし、エンゲージメントを促進",
    impact: "中",
  },
];

export default function EngagementPage() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          エンゲージメント分析
        </h1>
        <p className="mt-1 text-muted-foreground">
          各アクションの重み付けと最適化戦略を理解しましょう
        </p>
      </div>

      <Tabs defaultValue="weights" className="space-y-6">
        <TabsList className="glass">
          <TabsTrigger value="weights">重み付け</TabsTrigger>
          <TabsTrigger value="media">メディアブースト</TabsTrigger>
          <TabsTrigger value="negative">ネガティブシグナル</TabsTrigger>
          <TabsTrigger value="tips">最適化Tips</TabsTrigger>
        </TabsList>

        {/* Weights Tab */}
        <TabsContent value="weights" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Chart */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  エンゲージメント重み付けチャート
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={chartData} layout="vertical">
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={100}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
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
              <CardContent className="space-y-4">
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
                          {item.weight}x
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
                    リプライが最も重要
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    リプライと著者リプライの組み合わせは、いいねの5倍(150x vs 30x)の重み付けを持ちます。
                    これは、Xが双方向のコミュニケーションを最も価値あるエンゲージメントと見なしていることを示しています。
                    コンテンツ戦略では、リプライを促すような投稿を心がけましょう。
                  </p>
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

        {/* Negative Signals Tab */}
        <TabsContent value="negative" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                ネガティブシグナル
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {negativeSignals.map((signal) => (
                  <div
                    key={signal.action}
                    className="rounded-xl border border-destructive/30 bg-destructive/5 p-6"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground">
                        {signal.action}
                      </h4>
                      <span className="text-2xl font-bold text-destructive">
                        {signal.impact}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {signal.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl bg-orange-500/10 p-6 border border-orange-500/30">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-orange-500" />
                  <div>
                    <h4 className="font-semibold text-foreground">
                      90日ルールに注意
                    </h4>
                    <p className="mt-2 text-sm text-muted-foreground">
                      90日以上非アクティブなアカウントからのエンゲージメントは、
                      スコア計算から除外されます。また、新規アカウント(作成から90日未満)は
                      スコアにペナルティが適用される場合があります。
                    </p>
                  </div>
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
                    <span className="font-semibold text-primary">動画/画像</span> +{" "}
                    <span className="font-semibold text-accent">質問で締める</span> +{" "}
                    <span className="font-semibold text-[#00ba7c]">著者リプライに返信</span> ={" "}
                    <span className="font-bold text-foreground">最大エンゲージメント</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
