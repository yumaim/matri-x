"use client";

import { useState, useEffect, useCallback } from "react";
import { PlanGate } from "@/components/plan-gate";
import {
  Users,
  Heart,
  MessageSquare,
  Repeat2,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  Sparkles,
  ImageIcon,
  Video,
  FileText,
  Link2,
  History,
  RotateCcw,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SimulatorInputs {
  followers: number;
  following: number;
  accountAge: number;
  avgLikes: number;
  avgReplies: number;
  avgRetweets: number;
  activeFollowerRatio: number;
}

interface SimulationRecord {
  id: string;
  inputs: string;
  result: number;
  createdAt: string;
}

const mediaBoosts = [
  { type: "動画", icon: Video, boost: 3.0, color: "text-primary" },
  { type: "画像", icon: ImageIcon, boost: 1.8, color: "text-accent" },
  { type: "GIF", icon: FileText, boost: 1.5, color: "text-[#00ba7c]" },
  { type: "リンク", icon: Link2, boost: 1.2, color: "text-orange-500" },
  { type: "テキストのみ", icon: FileText, boost: 1.0, color: "text-muted-foreground" },
];

const scoreLevels = [
  { min: 0, max: 0.2, label: "低", color: "text-destructive", description: "改善が必要" },
  { min: 0.2, max: 0.4, label: "普通", color: "text-orange-500", description: "平均以下" },
  { min: 0.4, max: 0.6, label: "良好", color: "text-yellow-500", description: "平均的" },
  { min: 0.6, max: 0.8, label: "優秀", color: "text-[#00ba7c]", description: "平均以上" },
  { min: 0.8, max: 1.0, label: "最高", color: "text-primary", description: "トップクラス" },
];

function calculateTweepCred(inputs: SimulatorInputs): number {
  const ffRatio = inputs.following > 0 
    ? Math.min(inputs.followers / inputs.following, 10) / 10 
    : 0;
  
  const engagementScore = Math.min(
    ((inputs.avgLikes * 0.5 + inputs.avgReplies * 13.5 + inputs.avgRetweets * 1.0) / 
    Math.max(inputs.followers, 1)) * 100,
    1
  );
  
  const ageBonus = Math.min(inputs.accountAge / 365, 1) * 0.2;
  
  const activeBonus = inputs.activeFollowerRatio * 0.2;
  
  const agePenalty = inputs.accountAge < 90 ? 0.3 : 0;
  
  const rawScore = (ffRatio * 0.3) + (engagementScore * 0.3) + ageBonus + activeBonus - agePenalty;
  
  return Math.max(0, Math.min(rawScore, 1));
}

function getScoreLevel(score: number) {
  return scoreLevels.find((level) => score >= level.min && score < level.max) || scoreLevels[0];
}

export default function SimulatorPage() {
  return (
    <PlanGate requiredPlan="STANDARD" featureName="TweepCredシミュレーター">
      <SimulatorContent />
    </PlanGate>
  );
}

function SimulatorContent() {
  const [inputs, setInputs] = useState<SimulatorInputs>({
    followers: 1000,
    following: 500,
    accountAge: 365,
    avgLikes: 50,
    avgReplies: 10,
    avgRetweets: 5,
    activeFollowerRatio: 0.5,
  });

  const [score, setScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [history, setHistory] = useState<SimulationRecord[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [, setLastSavedId] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/simulator");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const saveSimulation = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs, result: score }),
      });
      if (res.ok) {
        const saved = await res.json();
        setLastSavedId(saved.id);
        await fetchHistory();
      }
    } catch (error) {
      console.error("Failed to save simulation:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const restoreInputs = (record: SimulationRecord) => {
    try {
      const parsed = JSON.parse(record.inputs) as SimulatorInputs;
      setInputs(parsed);
    } catch (error) {
      console.error("Failed to restore inputs:", error);
    }
  };

  useEffect(() => {
    setIsAnimating(true);
    const newScore = calculateTweepCred(inputs);
    const timer = setTimeout(() => {
      setScore(newScore);
      setIsAnimating(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputs]);

  const scoreLevel = getScoreLevel(score);
  const scorePercentage = score * 100;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          TweepCredシミュレーター
        </h1>
        <p className="mt-1 text-muted-foreground">
          あなたのアカウント信頼度スコアをシミュレーションしましょう
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Input Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                アカウント情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="followers">フォロワー数</Label>
                  <Input
                    id="followers"
                    type="number"
                    value={inputs.followers}
                    onChange={(e) =>
                      setInputs({ ...inputs, followers: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="following">フォロー数</Label>
                  <Input
                    id="following"
                    type="number"
                    value={inputs.following}
                    onChange={(e) =>
                      setInputs({ ...inputs, following: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>アカウント年齢 (日)</Label>
                  <span className="text-sm text-muted-foreground">
                    {inputs.accountAge}日
                  </span>
                </div>
                <Slider
                  value={[inputs.accountAge]}
                  onValueChange={([value]) =>
                    setInputs({ ...inputs, accountAge: value })
                  }
                  max={1825}
                  step={1}
                />
                {inputs.accountAge < 90 && (
                  <div className="flex items-center gap-2 text-sm text-orange-500">
                    <AlertTriangle className="h-4 w-4" />
                    90日未満のアカウントにはペナルティが適用されます
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>アクティブフォロワー比率</Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(inputs.activeFollowerRatio * 100)}%
                  </span>
                </div>
                <Slider
                  value={[inputs.activeFollowerRatio * 100]}
                  onValueChange={([value]) =>
                    setInputs({ ...inputs, activeFollowerRatio: value / 100 })
                  }
                  max={100}
                  step={1}
                />
                <p className="text-xs text-muted-foreground">
                  90日以内にアクティブなフォロワーの割合
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                平均エンゲージメント
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="avgLikes" className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-500" />
                    平均いいね数
                  </Label>
                  <Input
                    id="avgLikes"
                    type="number"
                    value={inputs.avgLikes}
                    onChange={(e) =>
                      setInputs({ ...inputs, avgLikes: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avgReplies" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    平均リプライ数
                  </Label>
                  <Input
                    id="avgReplies"
                    type="number"
                    value={inputs.avgReplies}
                    onChange={(e) =>
                      setInputs({ ...inputs, avgReplies: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avgRetweets" className="flex items-center gap-2">
                    <Repeat2 className="h-4 w-4 text-[#00ba7c]" />
                    平均リツイート数
                  </Label>
                  <Input
                    id="avgRetweets"
                    type="number"
                    value={inputs.avgRetweets}
                    onChange={(e) =>
                      setInputs({
                        ...inputs,
                        avgRetweets: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Score Display */}
        <div className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                TweepCredスコア
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Score Gauge */}
              <div className="relative flex flex-col items-center py-8">
                <div className="relative h-48 w-48">
                  {/* Background Circle */}
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-muted"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${scorePercentage * 2.83} 283`}
                      strokeLinecap="round"
                      className={cn(
                        "transition-all duration-500",
                        scoreLevel.color.replace("text-", "text-")
                      )}
                      style={{
                        stroke: score >= 0.8 ? "#1d9bf0" : 
                               score >= 0.6 ? "#00ba7c" :
                               score >= 0.4 ? "#eab308" :
                               score >= 0.2 ? "#f97316" : "#ef4444"
                      }}
                    />
                  </svg>
                  {/* Score Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className={cn(
                        "text-4xl font-bold transition-all",
                        isAnimating && "opacity-50"
                      )}
                    >
                      {score.toFixed(2)}
                    </span>
                    <span className={cn("text-sm font-medium", scoreLevel.color)}>
                      {scoreLevel.label}
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  {scoreLevel.description}
                </p>
                <Button
                  onClick={saveSimulation}
                  disabled={isSaving}
                  className="mt-4 w-full"
                >
                  {isSaving ? (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      結果を保存
                    </>
                  )}
                </Button>
              </div>

              {/* Score Factors */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">
                  スコア要因
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      フォロワー/フォロー比率
                    </span>
                    <span className="font-medium text-foreground">
                      {(inputs.followers / Math.max(inputs.following, 1)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      エンゲージメント率
                    </span>
                    <span className="font-medium text-foreground">
                      {(
                        ((inputs.avgLikes + inputs.avgReplies + inputs.avgRetweets) /
                          Math.max(inputs.followers, 1)) *
                        100
                      ).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      アクティブフォロワー
                    </span>
                    <span className="font-medium text-foreground">
                      {Math.round(inputs.activeFollowerRatio * 100)}%
                    </span>
                  </div>
                  {inputs.accountAge < 90 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-orange-500">90日ペナルティ</span>
                      <span className="font-medium text-orange-500">-0.30</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="glass border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h4 className="font-medium text-foreground">
                    スコアを上げるには
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-[#00ba7c]" />
                      積極的にリプライを促す
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-[#00ba7c]" />
                      動画コンテンツを活用
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-[#00ba7c]" />
                      定期的な投稿を継続
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Media Boost Table */}
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
                className="flex items-center gap-4 rounded-xl bg-muted/50 p-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background">
                  <media.icon className={cn("h-6 w-6", media.color)} />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{media.type}</div>
                  <div className={cn("text-2xl font-bold", media.color)}>
                    {media.boost}x
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-lg border border-primary/30 bg-primary/10 p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">
                動画コンテンツは最大3倍のブースト効果があります。
                特に最初の3秒で視聴者の注意を引くことが重要です。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simulation History */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            計算履歴
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              まだシミュレーション履歴がありません。上の「結果を保存」ボタンで記録しましょう。
            </p>
          ) : (
            <div className="space-y-3">
              {history.map((record) => {
                const parsedInputs = (() => {
                  try {
                    return JSON.parse(record.inputs) as SimulatorInputs;
                  } catch {
                    return null;
                  }
                })();
                const recordLevel = getScoreLevel(record.result);
                return (
                  <button
                    key={record.id}
                    onClick={() => restoreInputs(record)}
                    className="w-full rounded-lg bg-muted/50 p-4 text-left transition-colors hover:bg-muted/80"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("text-2xl font-bold", recordLevel.color)}>
                          {record.result.toFixed(2)}
                        </div>
                        <Badge variant="outline" className={recordLevel.color}>
                          {recordLevel.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(record.createdAt).toLocaleDateString("ja-JP", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    {parsedInputs && (
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>フォロワー: {parsedInputs.followers.toLocaleString()}</span>
                        <span>フォロー: {parsedInputs.following.toLocaleString()}</span>
                        <span>いいね: {parsedInputs.avgLikes}</span>
                        <span>リプライ: {parsedInputs.avgReplies}</span>
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                      <RotateCcw className="h-3 w-3" />
                      クリックで入力値を復元
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
