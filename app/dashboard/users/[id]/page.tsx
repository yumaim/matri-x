"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  FileText,
  MessageSquare,
  Zap,
  Star,
  Building2,
  Globe,
  CalendarDays,
  ArrowLeft,
  Trophy,
  BookmarkIcon,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Achievement definitions for display
const ACHIEVEMENT_META: Record<string, { label: string; emoji: string; description: string }> = {
  first_post: { label: "初投稿", emoji: "📝", description: "初めてフォーラムに投稿しました" },
  "10_posts": { label: "10投稿達成", emoji: "🔥", description: "10件の投稿を達成" },
  "50_posts": { label: "50投稿達成", emoji: "💎", description: "50件の投稿を達成" },
  first_verification: { label: "初検証", emoji: "🔬", description: "初めてアルゴリズム検証を投稿" },
  simulator_pro: { label: "シミュレーターPro", emoji: "🧪", description: "シミュレーターを10回以上利用" },
  first_comment: { label: "初コメント", emoji: "💬", description: "初めてコメントしました" },
  helpful: { label: "ヘルプフル", emoji: "🤝", description: "10個以上のいいねを獲得" },
  deep_learner: { label: "ディープラーナー", emoji: "🎓", description: "全トピックを完了" },
  contributor: { label: "コントリビューター", emoji: "⭐", description: "コミュニティへの貢献者" },
};

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  ALGORITHM: { label: "アルゴリズム解説", color: "border-blue-500/50 text-blue-400" },
  VERIFICATION: { label: "現場検証", color: "border-purple-500/50 text-purple-400" },
  HEAVY_RANKER: { label: "Heavy Ranker", color: "border-cyan-500/50 text-cyan-400" },
  SIMCLUSTERS: { label: "SimClusters", color: "border-indigo-500/50 text-indigo-400" },
  TWEEPCRED: { label: "TweepCred", color: "border-pink-500/50 text-pink-400" },
  STRATEGY: { label: "戦略・Tips", color: "border-emerald-500/50 text-emerald-400" },
  UPDATES: { label: "最新アップデート", color: "border-orange-500/50 text-orange-400" },
  QUESTIONS: { label: "質問・相談", color: "border-yellow-500/50 text-yellow-400" },
};

interface UserProfile {
  user: {
    id: string;
    name: string | null;
    image: string | null;
    role: string;
    plan: string;
    company: string | null;
    bio: string | null;
    website: string | null;
    xHandle: string | null;
    createdAt: string;
  };
  stats: {
    postCount: number;
    commentCount: number;
    level: number;
    xp: number;
    completedTopics: number;
    achievementCount: number;
  };
  posts: {
    id: string;
    title: string;
    category: string;
    viewCount: number;
    voteScore: number;
    commentCount: number;
    createdAt: string;
  }[];
  comments: {
    id: string;
    content: string;
    createdAt: string;
    post: { id: string; title: string };
  }[];
  achievements: {
    achievementId: string;
    unlockedAt: string;
  }[];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}分前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}日前`;
  const months = Math.floor(days / 30);
  return `${months}ヶ月前`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

function getInitials(name: string | null) {
  if (!name) return "?";
  return name.slice(0, 2).toUpperCase();
}

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOwnPage, setIsOwnPage] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, meRes] = await Promise.all([
        fetch(`/api/users/${id}`),
        fetch("/api/users/me").catch(() => null),
      ]);

      if (!profileRes.ok) {
        setError("ユーザーが見つかりません");
        return;
      }

      const profileData = await profileRes.json();
      setProfile(profileData);

      if (meRes && meRes.ok) {
        const meData = await meRes.json();
        setIsOwnPage(meData.id === id);
      }
    } catch {
      setError("プロフィールの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return <UserProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">{error || "ユーザーが見つかりません"}</p>
          <Link href="/dashboard">
            <Button variant="ghost" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              ダッシュボードに戻る
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { user, stats, posts, comments, achievements } = profile;

  return (
    <div className="overflow-x-hidden">
      {/* Cover Gradient Header */}
      <div className="relative h-32 sm:h-44 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      </div>

      <div className="p-4 sm:p-6 lg:p-8 -mt-16 sm:-mt-20 space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-background shrink-0">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold">
                  {user.name ?? "匿名ユーザー"}
                </h1>
                {user.role !== "USER" && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    user.role === "ADMIN"
                      ? "border-red-500/50 text-red-400"
                      : "border-blue-500/50 text-blue-400"
                  )}
                >
                  {user.role}
                </Badge>
              )}
              </div>
              {isOwnPage && (
                <Link href="/dashboard/profile">
                  <Button variant="outline" size="sm" className="shrink-0">
                    プロフィール編集
                  </Button>
                </Link>
              )}
            </div>
            {user.xHandle && (
              <a
                href={`https://x.com/${user.xHandle.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                @{user.xHandle.replace("@", "")}
              </a>
            )}
            {user.bio && (
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                {user.bio}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2 flex-wrap text-xs text-muted-foreground">
              {user.company && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {user.company}
                </span>
              )}
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {user.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </a>
              )}
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(user.createdAt)}に参加
              </span>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="glass">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-primary tabular-nums">
                {stats.postCount}
              </p>
              <p className="text-xs text-muted-foreground">投稿</p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-accent tabular-nums">
                {stats.commentCount}
              </p>
              <p className="text-xs text-muted-foreground">コメント</p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <Zap className="h-4 w-4 text-yellow-500" />
                <p className="text-xl font-bold text-yellow-500 tabular-nums">
                  Lv.{stats.level}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">レベル</p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-emerald-500 tabular-nums">
                {stats.xp.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">XP</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="glass w-full overflow-x-auto flex justify-start sm:justify-center no-scrollbar">
            <TabsTrigger value="posts" className="shrink-0 gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              投稿
            </TabsTrigger>
            <TabsTrigger value="comments" className="shrink-0 gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              コメント
            </TabsTrigger>
            <TabsTrigger value="achievements" className="shrink-0 gap-1.5">
              <Trophy className="h-3.5 w-3.5" />
              アチーブメント
            </TabsTrigger>
            {isOwnPage && (
              <TabsTrigger value="bookmarks" className="shrink-0 gap-1.5">
                <BookmarkIcon className="h-3.5 w-3.5" />
                ブックマーク
              </TabsTrigger>
            )}
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="mt-4">
            {posts.length === 0 ? (
              <EmptyState icon={FileText} message="まだ投稿がありません" />
            ) : (
              <div className="space-y-3">
                {posts.map((post) => {
                  const cat = CATEGORY_LABELS[post.category];
                  return (
                    <Link key={post.id} href={`/dashboard/forum/${post.id}`}>
                      <Card className="glass transition-all hover:scale-[1.005] hover:border-primary/30 cursor-pointer">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            {cat && (
                              <Badge
                                variant="outline"
                                className={cn("text-xs", cat.color)}
                              >
                                {cat.label}
                              </Badge>
                            )}
                            <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                              {post.title}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                {post.voteScore}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {post.commentCount}
                              </span>
                              <span className="flex items-center gap-1">
                                <ExternalLink className="h-3 w-3" />
                                {post.viewCount.toLocaleString()} views
                              </span>
                              <span>{timeAgo(post.createdAt)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="mt-4">
            {comments.length === 0 ? (
              <EmptyState icon={MessageSquare} message="まだコメントがありません" />
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <Link
                    key={comment.id}
                    href={`/dashboard/forum/${comment.post.id}`}
                  >
                    <Card className="glass transition-all hover:border-primary/30 cursor-pointer">
                      <CardContent className="p-4 space-y-2">
                        <p className="text-xs text-muted-foreground">
                          <span className="text-primary">{comment.post.title}</span>
                          {" "}への返信
                        </p>
                        <p className="text-sm line-clamp-3">
                          {comment.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {timeAgo(comment.createdAt)}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="mt-4">
            {achievements.length === 0 ? (
              <EmptyState icon={Trophy} message="まだアチーブメントがありません" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {achievements.map((ach) => {
                  const meta = ACHIEVEMENT_META[ach.achievementId] || {
                    label: ach.achievementId,
                    emoji: "🏅",
                    description: "",
                  };
                  return (
                    <Card
                      key={ach.achievementId}
                      className="glass border-amber-500/20"
                    >
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-2xl">
                          {meta.emoji}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{meta.label}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {meta.description}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {timeAgo(ach.unlockedAt)}に取得
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Bookmarks Tab (own page only) */}
          {isOwnPage && (
            <TabsContent value="bookmarks" className="mt-4">
              <div className="text-center py-12 text-muted-foreground">
                <BookmarkIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  ブックマークした投稿は{" "}
                  <Link href="/dashboard/forum" className="text-primary hover:underline">
                    フォーラム
                  </Link>{" "}
                  で確認できます
                </p>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  message,
}: {
  icon: React.ElementType;
  message: string;
}) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

function UserProfileSkeleton() {
  return (
    <div className="overflow-x-hidden">
      <div className="h-32 sm:h-44 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/10" />
      <div className="p-4 sm:p-6 lg:p-8 -mt-16 sm:-mt-20 space-y-6">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-muted animate-pulse shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-7 w-48 rounded bg-muted animate-pulse" />
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            <div className="h-12 w-full max-w-md rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
        <div className="h-10 w-full rounded bg-muted animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
