"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, GitCommit, Cloud, Clock } from "lucide-react";
import { formatDate } from "@/lib/format-utils";

interface DeployInfo {
    commitSha: string | null;
    commitMessage: string | null;
    commitRef: string | null;
    deployedAt: string | null;
    env: string | null;
}

export default function ChangelogPage() {
    const [deployInfo, setDeployInfo] = useState<DeployInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Vercel deploy info from environment variables (injected at build time)
        setDeployInfo({
            commitSha: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? null,
            commitMessage: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_MESSAGE ?? null,
            commitRef: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ?? null,
            deployedAt: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_DATE ?? null,
            env: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",
        });
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gradient">バージョン管理</h1>
                <p className="text-sm text-muted-foreground mt-1">デプロイ情報と変更履歴</p>
            </div>

            {/* Current Deploy */}
            <Card className="bg-card/50">
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <Cloud className="h-5 w-5 text-primary" />
                        <h2 className="font-semibold">現在のデプロイ</h2>
                        {deployInfo?.env && (
                            <Badge variant="outline" className={
                                deployInfo.env === "production"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            }>
                                {deployInfo.env}
                            </Badge>
                        )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <GitCommit className="h-3 w-3" /> コミットSHA
                            </span>
                            <p className="text-sm font-mono">
                                {deployInfo?.commitSha
                                    ? deployInfo.commitSha.slice(0, 8)
                                    : <span className="text-muted-foreground italic">ローカル開発環境</span>
                                }
                            </p>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Clock className="h-3 w-3" /> ブランチ
                            </span>
                            <p className="text-sm">
                                {deployInfo?.commitRef ?? <span className="text-muted-foreground italic">N/A</span>}
                            </p>
                        </div>

                        {deployInfo?.commitMessage && (
                            <div className="space-y-1 sm:col-span-2">
                                <span className="text-xs text-muted-foreground">コミットメッセージ</span>
                                <p className="text-sm bg-muted/30 rounded-md p-2 font-mono text-xs">
                                    {deployInfo.commitMessage}
                                </p>
                            </div>
                        )}

                        {deployInfo?.deployedAt && (
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground">デプロイ日時</span>
                                <p className="text-sm">{formatDate(deployInfo.deployedAt)}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Changes - Hardcoded changelog entries for now */}
            <div>
                <h2 className="font-semibold mb-3 flex items-center gap-2">
                    <GitCommit className="h-4 w-4 text-primary" />
                    最近の変更履歴
                </h2>
                <div className="space-y-3">
                    {[
                        {
                            version: "v0.9.0",
                            date: "2025-02-13",
                            changes: [
                                "つぶやき（MURMUR）カテゴリを追加",
                                "コンテンツ管理パネル（モデレーション機能）",
                                "モデレーター権限サポート",
                                "フォーラムのマイ投稿・ブックマークフィルタ",
                                "ADMIN BAN保護",
                                "ランキング複合スコア（posts×3+comments×2+votes×1）",
                            ],
                        },
                        {
                            version: "v0.8.0",
                            date: "2025-02-10",
                            changes: [
                                "フォーラム機能（投稿・コメント・投票）",
                                "ランキングシステム",
                                "管理者パネル",
                                "監査ログ",
                                "ユーザープロフィール",
                            ],
                        },
                    ].map((release) => (
                        <Card key={release.version} className="bg-card/50">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                                        {release.version}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">{release.date}</span>
                                </div>
                                <ul className="space-y-1">
                                    {release.changes.map((change, i) => (
                                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                            <span className="text-primary mt-1">•</span>
                                            {change}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
