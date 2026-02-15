"use client";

import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TermTooltipProps {
  term: string;
  definition: string;
  example?: string;
  inline?: boolean;
  className?: string;
}

export function TermTooltip({ term, definition, example, inline = false, className }: TermTooltipProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {inline ? (
            <span className={cn("underline decoration-dotted decoration-primary/50 cursor-help hover:decoration-primary transition-colors", className)}>
              {term}
            </span>
          ) : (
            <button className={cn("inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors", className)}>
              {term}
              <HelpCircle className="h-3 w-3 opacity-60" />
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-3" side="top">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-foreground">{term}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{definition}</p>
            {example && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <p className="text-[10px] text-muted-foreground/70 font-medium mb-1">例:</p>
                <p className="text-[10px] text-muted-foreground italic">{example}</p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// 用語集データ
export const algorithmTerms = {
  // 基本概念
  transformer: {
    term: "Transformer",
    definition: "文脈を理解して情報を処理するAIモデルの仕組み。文章の前後関係を把握して、より正確な予測ができます。",
    example: "ChatGPTもTransformerを使っています。あなたの過去の会話を覚えているのと同じように、Xもあなたの過去のいいねやリプライを記憶しています。",
  },
  embedding: {
    term: "Embedding（埋め込み）",
    definition: "テキストやユーザーを数値のリストに変換したもの。似ている内容は似た数値になります。",
    example: "「猫が好き」と「ネコが好き」は同じembeddingになります。",
  },
  twoTower: {
    term: "Two-Tower Model",
    definition: "ユーザーと投稿を別々に処理してから、マッチング度を計算する仕組み。",
    example: "マッチングアプリで「あなた」と「相手」のプロフィールを別々に分析してから、相性スコアを出すイメージです。",
  },
  candidateIsolation: {
    term: "Candidate Isolation",
    definition: "各候補ツイートを独立して評価する仕組み。他のツイートの影響を受けません。",
    example: "複数の商品を見る時、1つ1つ独立して評価するので、比較する商品が変わってもスコアは変わりません。",
  },
  attentionMask: {
    term: "Attention Mask",
    definition: "AIが「どの情報を見ていいか」を制御するルール。",
    example: "試験中に「この問題は教科書のこのページだけ見ていい」と指定されるのと同じです。",
  },
  
  // エンゲージメント
  engagement: {
    term: "Engagement（エンゲージメント）",
    definition: "ユーザーがツイートに対して行うアクション（いいね、リプライ、リポストなど）。",
    example: "いいねをタップする、リプライを書く、プロフィールをクリックする、などすべてエンゲージメントです。",
  },
  
  // ランキング
  heavyRanker: {
    term: "Heavy Ranker",
    definition: "大量の特徴量を使って精密にツイートをランク付けするモデル（旧アルゴリズム）。",
    example: "6,000個のチェック項目を1つ1つ確認してスコアを出していました。",
  },
  lightRanker: {
    term: "Light Ranker",
    definition: "少ない特徴量で高速に候補を絞り込むモデル（旧アルゴリズム）。",
    example: "まず簡易的に「良さそうなツイート100個」を選んでから、Heavy Rankerで詳しく見る流れでした。",
  },
  
  // データストア
  inNetwork: {
    term: "In-Network",
    definition: "あなたがフォローしているアカウントからのツイート。",
    example: "友達の投稿やフォローしている有名人のツイートです。",
  },
  outOfNetwork: {
    term: "Out-of-Network",
    definition: "フォローしていないアカウントからのツイート。アルゴリズムがおすすめするもの。",
    example: "「おすすめ」タブに出てくる、知らない人の投稿です。",
  },
  
  // インフラ
  kafka: {
    term: "Kafka",
    definition: "リアルタイムでデータを流すシステム。ツイートやいいねなどのイベントを瞬時に配信します。",
    example: "YouTubeのライブストリームのように、今起きていることを即座に他のシステムに伝えます。",
  },
  thunder: {
    term: "Thunder",
    definition: "フォローしているアカウントからのツイートを超高速で取得する新システム（Rust製）。",
    example: "従来の10倍以上速く、フォロー中の人の最新ツイートを取ってきます。",
  },
  phoenix: {
    term: "Phoenix",
    definition: "Grok AIを使った新しいランキングシステム。より文脈を理解してツイートをスコアリングします。",
    example: "あなたの興味や過去の行動を深く理解して、「今のあなたに最適なツイート」を選びます。",
  },
  
  // ML用語
  dotProduct: {
    term: "Dot Product（内積）",
    definition: "2つの数値リストの類似度を計算する方法。値が大きいほど似ています。",
    example: "あなたの好みベクトルと投稿の特徴ベクトルをかけ合わせて、マッチ度を出します。",
  },
  latency: {
    term: "Latency（レイテンシ）",
    definition: "処理にかかる時間。低いほど高速です。",
    example: "Thunderはレイテンシが1ミリ秒以下（瞬き1回より速い）です。",
  },
  batchProcessing: {
    term: "Batch Processing（バッチ処理）",
    definition: "データをまとめて一度に処理すること。リアルタイムではありません。",
    example: "1日1回、夜中に全ユーザーのデータを計算し直す、など。",
  },
};

// 便利なラッパー関数
export function Term({ id, children }: { id: keyof typeof algorithmTerms; children?: React.ReactNode }) {
  const data = algorithmTerms[id];
  return (
    <TermTooltip
      term={children?.toString() || data.term}
      definition={data.definition}
      example={data.example}
      inline
    />
  );
}
