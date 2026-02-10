"use client";

import {
  FlaskConical,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  Clock,
  BarChart3,
  Hash,
  Sparkles,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const EVIDENCE_TYPE_LABELS: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  IMPRESSION_TEST: {
    label: "インプレッション検証",
    icon: BarChart3,
    color: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  },
  ENGAGEMENT_TEST: {
    label: "エンゲージメント検証",
    icon: TrendingUp,
    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  },
  TIMING_TEST: {
    label: "投稿時間検証",
    icon: Clock,
    color: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  },
  CONTENT_TEST: {
    label: "コンテンツ形式検証",
    icon: FileText,
    color: "text-purple-400 bg-purple-400/10 border-purple-400/30",
  },
  HASHTAG_TEST: {
    label: "ハッシュタグ検証",
    icon: Hash,
    color: "text-pink-400 bg-pink-400/10 border-pink-400/30",
  },
  OTHER: {
    label: "その他",
    icon: Sparkles,
    color: "text-muted-foreground bg-muted/30 border-muted-foreground/30",
  },
};

interface EvidenceData {
  id: string;
  type: string;
  description: string;
  beforeData?: Record<string, unknown> | null;
  afterData?: Record<string, unknown> | null;
  conclusion?: string | null;
  createdAt: string;
}

interface EvidenceCardProps {
  evidence: EvidenceData;
}

function DataDisplay({ label, data, trend }: { label: string; data: Record<string, unknown> | null | undefined; trend?: "up" | "down" }) {
  if (!data) return null;

  return (
    <div className="flex-1 min-w-[200px]">
      <div className="flex items-center gap-1.5 mb-2">
        {trend === "up" ? (
          <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
        ) : trend === "down" ? (
          <TrendingDown className="h-3.5 w-3.5 text-red-400" />
        ) : null}
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="bg-background/50 rounded-lg p-3 border border-border/30 space-y-1.5">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{key}</span>
            <span className="font-medium text-foreground tabular-nums">
              {typeof value === "number"
                ? value.toLocaleString()
                : String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EvidenceCard({ evidence }: EvidenceCardProps) {
  const typeInfo = EVIDENCE_TYPE_LABELS[evidence.type] ?? EVIDENCE_TYPE_LABELS.OTHER;
  const TypeIcon = typeInfo.icon;

  return (
    <Card className="bg-card/30 border-border/50 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={cn("gap-1 text-xs", typeInfo.color)}>
            <TypeIcon className="h-3 w-3" />
            {typeInfo.label}
          </Badge>
          <span className="text-xs text-muted-foreground ml-auto">
            {new Date(evidence.createdAt).toLocaleDateString("ja-JP")}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-foreground/90 whitespace-pre-wrap">
          {evidence.description}
        </p>

        {/* Before / After */}
        {(evidence.beforeData || evidence.afterData) && (
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <DataDisplay label="Before" data={evidence.beforeData} />
            {evidence.beforeData && evidence.afterData && (
              <div className="flex items-center justify-center shrink-0">
                <ArrowRight className="h-5 w-5 text-muted-foreground rotate-90 sm:rotate-0" />
              </div>
            )}
            <DataDisplay label="After" data={evidence.afterData} trend="up" />
          </div>
        )}

        {/* Conclusion */}
        {evidence.conclusion && (
          <div className="bg-emerald-400/5 border border-emerald-400/20 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400 uppercase tracking-wide">
                結論
              </span>
            </div>
            <p className="text-sm text-foreground/90">{evidence.conclusion}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function EvidenceSection({ evidence }: { evidence: EvidenceData[] }) {
  if (evidence.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FlaskConical className="h-5 w-5 text-purple-400" />
        <h3 className="font-semibold text-foreground">
          検証エビデンス ({evidence.length})
        </h3>
      </div>
      <div className="space-y-4">
        {evidence.map((e) => (
          <EvidenceCard key={e.id} evidence={e} />
        ))}
      </div>
    </div>
  );
}
