"use client";

import { useState } from "react";
import {
  MessageCircle,
  ThumbsUp,
  MessageSquare,
  Clock,
  TrendingUp,
  Filter,
  Search,
  Plus,
  ChevronRight,
  Pin,
  Eye,
  User,
  Tag,
  Flame,
  Award,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", name: "すべて", icon: MessageCircle, count: 156 },
  { id: "algorithm", name: "アルゴリズム解説", icon: BookOpen, count: 45 },
  { id: "strategy", name: "戦略・Tips", icon: TrendingUp, count: 38 },
  { id: "updates", name: "最新アップデート", icon: Flame, count: 23 },
  { id: "questions", name: "質問・相談", icon: MessageSquare, count: 50 },
];

const forumPosts = [
  {
    id: 1,
    title: "【解説】SimClustersの仕組みを図解してみた",
    author: "algo_master",
    authorAvatar: "AM",
    category: "algorithm",
    tags: ["SimClusters", "図解", "初心者向け"],
    likes: 234,
    replies: 45,
    views: 1523,
    isPinned: true,
    isHot: true,
    createdAt: "2時間前",
    preview: "SimClustersは、Xのアルゴリズムの中核を担う興味関心クラスタリングシステムです...",
  },
  {
    id: 2,
    title: "リプライが150xの重み付けを持つ理由を考察",
    author: "marketing_pro",
    authorAvatar: "MP",
    category: "strategy",
    tags: ["エンゲージメント", "リプライ", "考察"],
    likes: 189,
    replies: 67,
    views: 2341,
    isPinned: true,
    isHot: false,
    createdAt: "5時間前",
    preview: "なぜリプライがこれほど高い重み付けを持つのか、アルゴリズムの設計思想から紐解いていきます...",
  },
  {
    id: 3,
    title: "TweepCredスコアを上げるための実践的アプローチ",
    author: "growth_hacker",
    authorAvatar: "GH",
    category: "strategy",
    tags: ["TweepCred", "実践", "スコア向上"],
    likes: 156,
    replies: 34,
    views: 1876,
    isPinned: false,
    isHot: true,
    createdAt: "1日前",
    preview: "TweepCredスコアを効果的に上げるための具体的な方法をシェアします...",
  },
  {
    id: 4,
    title: "2026年1月のアルゴリズム変更点まとめ",
    author: "update_watcher",
    authorAvatar: "UW",
    category: "updates",
    tags: ["アップデート", "2026年", "変更点"],
    likes: 312,
    replies: 89,
    views: 4521,
    isPinned: false,
    isHot: true,
    createdAt: "3日前",
    preview: "GitHubのコミット履歴から、2026年1月に行われた主要な変更点を分析しました...",
  },
  {
    id: 5,
    title: "Out-of-Networkツイートが増えた?調査結果",
    author: "data_analyst",
    authorAvatar: "DA",
    category: "algorithm",
    tags: ["Out-of-Network", "データ分析", "調査"],
    likes: 98,
    replies: 23,
    views: 987,
    isPinned: false,
    isHot: false,
    createdAt: "4日前",
    preview: "最近タイムラインでOut-of-Networkのツイートが増えた気がしたので調査してみました...",
  },
  {
    id: 6,
    title: "初心者です。アルゴリズムの学習順序を教えてください",
    author: "newbie_2026",
    authorAvatar: "NB",
    category: "questions",
    tags: ["質問", "初心者", "学習方法"],
    likes: 45,
    replies: 12,
    views: 432,
    isPinned: false,
    isHot: false,
    createdAt: "5日前",
    preview: "Xのアルゴリズムを学び始めたばかりです。どこから始めるのがおすすめですか?...",
  },
];

const topContributors = [
  { name: "algo_master", avatar: "AM", posts: 156, likes: 4532, badge: "Expert" },
  { name: "marketing_pro", avatar: "MP", posts: 89, likes: 2341, badge: "Pro" },
  { name: "growth_hacker", avatar: "GH", posts: 67, likes: 1987, badge: "Pro" },
  { name: "update_watcher", avatar: "UW", posts: 45, likes: 1543, badge: "Contributor" },
];

export default function ForumPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = forumPosts.filter((post) => {
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            フォーラム
          </h1>
          <p className="mt-1 text-muted-foreground">
            アルゴリズムについてコミュニティと議論しましょう
          </p>
        </div>
        <Button className="glow-primary">
          <Plus className="h-4 w-4 mr-2" />
          新規投稿
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="トピックを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-border"
          />
        </div>
        <Button variant="outline" className="bg-transparent">
          <Filter className="h-4 w-4 mr-2" />
          フィルター
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all whitespace-nowrap",
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <category.icon className="h-4 w-4" />
                {category.name}
                <span className="text-xs opacity-70">({category.count})</span>
              </button>
            ))}
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                className={cn(
                  "glass transition-all hover:glow-primary cursor-pointer",
                  post.isPinned && "ring-1 ring-primary/50"
                )}
              >
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {post.authorAvatar}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title & Badges */}
                      <div className="flex items-start gap-2 flex-wrap">
                        {post.isPinned && (
                          <Badge variant="outline" className="shrink-0 border-primary/50 text-primary">
                            <Pin className="h-3 w-3 mr-1" />
                            固定
                          </Badge>
                        )}
                        {post.isHot && (
                          <Badge className="shrink-0 bg-orange-500/20 text-orange-500 border-orange-500/50">
                            <Flame className="h-3 w-3 mr-1" />
                            人気
                          </Badge>
                        )}
                        <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                      </div>

                      {/* Preview */}
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {post.preview}
                      </p>

                      {/* Tags */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-muted text-muted-foreground text-xs"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Meta */}
                      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {post.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.createdAt}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {post.replies}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.views}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center">
            <Button variant="outline" className="bg-transparent">
              もっと見る
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Contributors */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                トップコントリビューター
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topContributors.map((contributor, index) => (
                <div
                  key={contributor.name}
                  className="flex items-center gap-3"
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/20 text-primary text-sm">
                        {contributor.avatar}
                      </AvatarFallback>
                    </Avatar>
                    {index < 3 && (
                      <div className={cn(
                        "absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white",
                        index === 0 ? "bg-yellow-500" :
                        index === 1 ? "bg-gray-400" : "bg-orange-600"
                      )}>
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {contributor.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {contributor.posts}投稿 / {contributor.likes}いいね
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      contributor.badge === "Expert" && "border-yellow-500/50 text-yellow-500",
                      contributor.badge === "Pro" && "border-primary/50 text-primary",
                      contributor.badge === "Contributor" && "border-muted-foreground/50 text-muted-foreground"
                    )}
                  >
                    {contributor.badge}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base">コミュニティ統計</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">総トピック数</span>
                <span className="font-semibold text-foreground">156</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">総コメント数</span>
                <span className="font-semibold text-foreground">2,341</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">アクティブユーザー</span>
                <span className="font-semibold text-foreground">89</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">今日の投稿</span>
                <span className="font-semibold text-primary">+12</span>
              </div>
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Card className="glass border-l-4 border-l-primary">
            <CardContent className="p-4">
              <h4 className="font-medium text-foreground text-sm">コミュニティガイドライン</h4>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>- 建設的な議論を心がけましょう</li>
                <li>- 情報源を明記しましょう</li>
                <li>- 他のユーザーを尊重しましょう</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
