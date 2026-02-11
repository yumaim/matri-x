"use client";

import { useState, useEffect, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Clock,
  Tag,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Pin,
  FlaskConical,
  Share2,
  MessageSquare,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VoteButton } from "@/components/forum/vote-button";
import { PostReactions } from "@/components/forum/post-reactions";
import { CommentSection } from "@/components/forum/comment-section";
import { EvidenceSection } from "@/components/forum/evidence-card";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  ALGORITHM: { label: "アルゴリズム解説", color: "border-blue-500/50 text-blue-400" },
  VERIFICATION: { label: "現場検証", color: "border-purple-500/50 text-purple-400" },
  STRATEGY: { label: "戦略・Tips", color: "border-emerald-500/50 text-emerald-400" },
  UPDATES: { label: "最新アップデート", color: "border-orange-500/50 text-orange-400" },
  QUESTIONS: { label: "質問・相談", color: "border-yellow-500/50 text-yellow-400" },
};

const EVIDENCE_TYPES = [
  { value: "IMPRESSION_TEST", label: "インプレッション検証" },
  { value: "ENGAGEMENT_TEST", label: "エンゲージメント検証" },
  { value: "TIMING_TEST", label: "投稿時間検証" },
  { value: "CONTENT_TEST", label: "コンテンツ形式検証" },
  { value: "HASHTAG_TEST", label: "ハッシュタグ検証" },
  { value: "OTHER", label: "その他" },
];

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name.split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "たった今";
  if (diffMin < 60) return `${diffMin}分前`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}時間前`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}日前`;
  return `${Math.floor(diffDay / 30)}ヶ月前`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderMarkdown(content: string): React.ReactNode[] {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeKey = 0;

  const processInline = (text: string): React.ReactNode => {
    // Bold, italic, inline code, links
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Inline code
      const codeMatch = remaining.match(/^(.*?)`([^`]+)`(.*)$/);
      if (codeMatch) {
        if (codeMatch[1]) parts.push(codeMatch[1]);
        parts.push(<code key={`c${key++}`} className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-primary">{codeMatch[2]}</code>);
        remaining = codeMatch[3];
        continue;
      }
      // Bold
      const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)$/);
      if (boldMatch) {
        if (boldMatch[1]) parts.push(boldMatch[1]);
        parts.push(<strong key={`b${key++}`} className="font-semibold text-foreground">{boldMatch[2]}</strong>);
        remaining = boldMatch[3];
        continue;
      }
      // Link
      const linkMatch = remaining.match(/^(.*?)\[([^\]]+)\]\(([^)]+)\)(.*)$/);
      if (linkMatch) {
        if (linkMatch[1]) parts.push(linkMatch[1]);
        parts.push(<a key={`l${key++}`} href={linkMatch[3]} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">{linkMatch[2]}</a>);
        remaining = linkMatch[4];
        continue;
      }
      parts.push(remaining);
      break;
    }
    return parts.length === 1 ? parts[0] : <>{parts}</>;
  };

  lines.forEach((line, i) => {
    // Code block toggle
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${codeKey++}`} className="bg-muted/50 rounded-lg p-4 font-mono text-xs my-3 overflow-x-auto">
            <code>{codeLines.join("\n")}</code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    // Headings
    if (line.startsWith("### ")) {
      elements.push(<h4 key={i} className="font-semibold text-foreground mt-4 mb-2">{processInline(line.slice(4))}</h4>);
      return;
    }
    if (line.startsWith("## ")) {
      elements.push(<h3 key={i} className="font-bold text-lg text-foreground mt-6 mb-2">{processInline(line.slice(3))}</h3>);
      return;
    }
    if (line.startsWith("# ")) {
      elements.push(<h2 key={i} className="font-bold text-xl text-foreground mt-6 mb-3">{processInline(line.slice(2))}</h2>);
      return;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={i} className="border-l-4 border-primary/30 pl-4 my-2 text-muted-foreground italic">
          {processInline(line.slice(2))}
        </blockquote>
      );
      return;
    }

    // List items
    if (line.match(/^[-*] /)) {
      elements.push(
        <li key={i} className="ml-4 list-disc text-foreground/90">
          {processInline(line.slice(2))}
        </li>
      );
      return;
    }

    // Numbered list
    if (line.match(/^\d+\. /)) {
      const text = line.replace(/^\d+\. /, "");
      elements.push(
        <li key={i} className="ml-4 list-decimal text-foreground/90">
          {processInline(text)}
        </li>
      );
      return;
    }

    // Empty line
    if (!line.trim()) {
      elements.push(<br key={i} />);
      return;
    }

    elements.push(
      <p key={i} className="text-foreground/90 leading-relaxed">
        {processInline(line)}
      </p>
    );
  });

  // Close any unclosed code block
  if (inCodeBlock && codeLines.length > 0) {
    elements.push(
      <pre key={`code-${codeKey}`} className="bg-muted/50 rounded-lg p-4 font-mono text-xs my-3 overflow-x-auto">
        <code>{codeLines.join("\n")}</code>
      </pre>
    );
  }

  return elements;
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [post, setPost] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showEvidenceDialog, setShowEvidenceDialog] = useState(false);
  const [evidenceForm, setEvidenceForm] = useState({
    type: "",
    description: "",
    beforeData: "",
    afterData: "",
    conclusion: "",
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [postRes, commentsRes] = await Promise.all([
          fetch(`/api/forum/posts/${postId}`),
          fetch(`/api/forum/posts/${postId}/comments`),
        ]);

        if (!postRes.ok) {
          router.push("/dashboard/forum");
          return;
        }

        const postData = await postRes.json();
        setPost(postData);
        setIsBookmarked(postData.isBookmarked);

        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          setComments(commentsData.comments);
        }

        // Get current user session
        try {
          const sessionRes = await fetch("/api/auth/session");
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json();
            setCurrentUser(sessionData?.user ?? null);
          }
        } catch { /* ignore */ }
      } catch (e) {
        console.error("Fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId, router]);

  const handleBookmark = () => {
    const prev = isBookmarked;
    setIsBookmarked(!isBookmarked);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/forum/posts/${postId}/bookmark`, {
          method: "POST",
        });
        if (!res.ok) {
          setIsBookmarked(prev);
          return;
        }
        const data = await res.json();
        setIsBookmarked(data.isBookmarked);
      } catch {
        setIsBookmarked(prev);
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("この投稿を削除しますか？")) return;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/forum/posts/${postId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          router.push("/dashboard/forum");
        }
      } catch (e) {
        console.error("Delete failed:", e);
      }
    });
  };

  const handleSubmitEvidence = () => {
    if (!evidenceForm.type || !evidenceForm.description) return;

    startTransition(async () => {
      try {
        let beforeData = null;
        let afterData = null;
        try {
          if (evidenceForm.beforeData) beforeData = JSON.parse(evidenceForm.beforeData);
        } catch { /* keep null */ }
        try {
          if (evidenceForm.afterData) afterData = JSON.parse(evidenceForm.afterData);
        } catch { /* keep null */ }

        const res = await fetch(`/api/forum/posts/${postId}/evidence`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: evidenceForm.type,
            description: evidenceForm.description,
            beforeData,
            afterData,
            conclusion: evidenceForm.conclusion || undefined,
          }),
        });

        if (res.ok) {
          const newEvidence = await res.json();
          setPost((prev: typeof post) => ({
            ...prev,
            evidence: [newEvidence, ...(prev?.evidence ?? [])],
          }));
          setShowEvidenceDialog(false);
          setEvidenceForm({ type: "", description: "", beforeData: "", afterData: "", conclusion: "" });
        }
      } catch (e) {
        console.error("Evidence submit failed:", e);
      }
    });
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!post) return null;

  const cat = CATEGORY_LABELS[post.category];
  const isAuthor = currentUser?.id === post.author?.id;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
      {/* Back button */}
      <Link
        href="/dashboard/forum"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        フォーラムに戻る
      </Link>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Post */}
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex gap-4">
                {/* Vote column */}
                <div className="hidden sm:block shrink-0">
                  <VoteButton
                    postId={post.id}
                    initialScore={post.voteScore}
                    initialUserVote={post.userVote}
                    orientation="vertical"
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-4">
                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {post.isPinned && (
                      <Badge variant="outline" className="border-primary/50 text-primary text-xs gap-1">
                        <Pin className="h-3 w-3" /> 固定
                      </Badge>
                    )}
                    {post.isVerified && (
                      <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 text-xs gap-1">
                        <CheckCircle2 className="h-3 w-3" /> 検証済み
                      </Badge>
                    )}
                    {cat && (
                      <Badge variant="outline" className={cn("text-xs", cat.color)}>
                        {cat.label}
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                    {post.title}
                  </h1>

                  {/* Author & Meta */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        {post.author?.image && <AvatarImage src={post.author.image} />}
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(post.author?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {post.author?.name ?? "匿名"}
                        </p>
                        {post.author?.xHandle && (
                          <p className="text-xs text-muted-foreground">@{post.author.xHandle}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(post.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.viewCount?.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {post._count?.comments ?? 0}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map((tag: string) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="bg-muted/60 text-muted-foreground text-xs font-normal gap-1"
                        >
                          <Tag className="h-2.5 w-2.5" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Separator className="bg-border/30" />

                  {/* Content */}
                  <div className="prose prose-sm prose-invert max-w-none">
                    {renderMarkdown(post.content)}
                  </div>

                  <Separator className="bg-border/30" />

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="sm:hidden">
                      <VoteButton
                        postId={post.id}
                        initialScore={post.voteScore}
                        initialUserVote={post.userVote}
                        size="sm"
                        orientation="horizontal"
                      />
                    </div>

                    {/* Reactions */}
                    <PostReactions postId={post.id} />

                    <Button
                      variant={isBookmarked ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "gap-1.5",
                        !isBookmarked && "bg-transparent"
                      )}
                      onClick={handleBookmark}
                      disabled={isPending}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="h-3.5 w-3.5" />
                      ) : (
                        <Bookmark className="h-3.5 w-3.5" />
                      )}
                      {isBookmarked ? "ブックマーク済み" : "ブックマーク"}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 bg-transparent"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                      }}
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      コピー
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 bg-transparent"
                      onClick={() => {
                        const text = `${post.title} | matri-x`;
                        const shareUrl = `${window.location.origin}/share/${post.id}`;
                        window.open(
                          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
                          "_blank",
                          "width=550,height=420"
                        );
                      }}
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      Xで共有
                    </Button>

                    {isAuthor && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="bg-transparent h-8 w-8 ml-auto">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Pencil className="h-3.5 w-3.5 mr-2" />
                            編集
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={handleDelete}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            削除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evidence Section */}
          {post.evidence && post.evidence.length > 0 && (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 sm:p-6">
                <EvidenceSection evidence={post.evidence} />
              </CardContent>
            </Card>
          )}

          {/* Add Evidence */}
          <Dialog open={showEvidenceDialog} onOpenChange={setShowEvidenceDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent w-full border-dashed border-border/50 hover:border-primary/50">
                <FlaskConical className="h-4 w-4" />
                検証エビデンスを追加
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-purple-400" />
                  検証エビデンスを追加
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>検証タイプ</Label>
                  <Select
                    value={evidenceForm.type}
                    onValueChange={(v) => setEvidenceForm((p) => ({ ...p, type: v }))}
                  >
                    <SelectTrigger className="bg-muted/30 border-border/50">
                      <SelectValue placeholder="タイプを選択..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EVIDENCE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>説明</Label>
                  <Textarea
                    placeholder="検証内容を説明..."
                    value={evidenceForm.description}
                    onChange={(e) => setEvidenceForm((p) => ({ ...p, description: e.target.value }))}
                    className="min-h-[100px] bg-muted/30 border-border/50 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Before データ (JSON)</Label>
                    <Textarea
                      placeholder='{"impressions": 1000}'
                      value={evidenceForm.beforeData}
                      onChange={(e) => setEvidenceForm((p) => ({ ...p, beforeData: e.target.value }))}
                      className="min-h-[80px] bg-muted/30 border-border/50 resize-none font-mono text-xs"
                    />
                  </div>
                  <div>
                    <Label>After データ (JSON)</Label>
                    <Textarea
                      placeholder='{"impressions": 5000}'
                      value={evidenceForm.afterData}
                      onChange={(e) => setEvidenceForm((p) => ({ ...p, afterData: e.target.value }))}
                      className="min-h-[80px] bg-muted/30 border-border/50 resize-none font-mono text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label>結論</Label>
                  <Textarea
                    placeholder="検証結果から得られた結論..."
                    value={evidenceForm.conclusion}
                    onChange={(e) => setEvidenceForm((p) => ({ ...p, conclusion: e.target.value }))}
                    className="min-h-[60px] bg-muted/30 border-border/50 resize-none"
                  />
                </div>
                <Button
                  className="w-full gap-2"
                  onClick={handleSubmitEvidence}
                  disabled={isPending || !evidenceForm.type || !evidenceForm.description}
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Plus className="h-4 w-4" />
                  エビデンスを追加
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Comments */}
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 sm:p-6">
              <CommentSection
                postId={post.id}
                initialComments={comments}
                currentUserId={currentUser?.id}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Author info */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">投稿者</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  {post.author?.image && <AvatarImage src={post.author.image} />}
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(post.author?.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/dashboard/users/${post.author?.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                    {post.author?.name ?? "匿名"}
                  </Link>
                  {post.author?.role !== "USER" && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        post.author?.role === "ADMIN"
                          ? "border-red-500/50 text-red-400"
                          : "border-yellow-500/50 text-yellow-400"
                      )}
                    >
                      {post.author?.role === "ADMIN" ? "管理者" : "モデレーター"}
                    </Badge>
                  )}
                </div>
              </div>
              {post.author?.bio && (
                <p className="text-xs text-muted-foreground">{post.author.bio}</p>
              )}
              {/* Links */}
              <div className="space-y-1.5">
                {post.author?.xHandle && (
                  <a
                    href={`https://x.com/${post.author.xHandle.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <span className="font-bold text-sm">𝕏</span>
                    <span>@{post.author.xHandle.replace(/^@/, "")}</span>
                  </a>
                )}
                {post.author?.website && (
                  <a
                    href={post.author.website.startsWith("http") ? post.author.website : `https://${post.author.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors truncate"
                  >
                    <span>🔗</span>
                    <span className="truncate">{post.author.website.replace(/^https?:\/\//, "")}</span>
                  </a>
                )}
                {(post.author?.company || post.author?.community) && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>🏢</span>
                    <span>{post.author.company || post.author.community}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Related posts */}
          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">関連投稿</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {post.relatedPosts.map((related: any) => (
                  <Link
                    key={related.id}
                    href={`/dashboard/forum/${related.id}`}
                    className="block group"
                  >
                    <p className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {related.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {related._count?.comments ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {related.viewCount}
                      </span>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
