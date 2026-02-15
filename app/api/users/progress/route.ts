import { NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

const ACHIEVEMENTS = [
  // 基本活動（Free）
  { id: "first_login", name: "はじめの一歩", description: "matri-xに初めてログイン", icon: "🎯", xp: 10, tier: "bronze" },
  { id: "first_post", name: "発言者", description: "フォーラムに初投稿", icon: "💬", xp: 20, tier: "bronze" },
  { id: "first_comment", name: "交流の第一歩", description: "初めてのコメント投稿", icon: "💭", xp: 15, tier: "bronze" },
  { id: "first_vote", name: "いいね職人", description: "初めての投票", icon: "👆", xp: 10, tier: "bronze" },
  // フォーラム活動（Silver）
  { id: "5_posts", name: "常連メンバー", description: "フォーラムに5件投稿", icon: "📝", xp: 50, tier: "silver" },
  { id: "10_comments", name: "議論好き", description: "10件以上のコメント", icon: "🗣️", xp: 30, tier: "silver" },
  { id: "10_votes", name: "目利き", description: "10件以上の投票", icon: "👁️", xp: 20, tier: "silver" },
  { id: "first_verification", name: "検証者", description: "初めての検証レポート", icon: "🔬", xp: 30, tier: "silver" },
  // 深い活動（Gold）
  { id: "20_posts", name: "情報発信者", description: "フォーラムに20件投稿", icon: "🏆", xp: 80, tier: "gold" },
  { id: "community_builder", name: "コミュニティビルダー", description: "50件以上のコメント", icon: "🤝", xp: 50, tier: "gold" },
  { id: "3_verifications", name: "検証マスター", description: "3件以上の検証レポート", icon: "⚗️", xp: 60, tier: "gold" },
  { id: "popular_post", name: "バズメーカー", description: "10以上のスコアを獲得した投稿", icon: "🔥", xp: 40, tier: "gold" },
  // 学習系
  { id: "pipeline_master", name: "パイプラインマスター", description: "パイプライン探索を全セクション閲覧", icon: "🔧", xp: 40, tier: "silver" },
  { id: "simulator_pro", name: "シミュレーター達人", description: "シミュレーターを5回以上使用", icon: "🧮", xp: 30, tier: "silver" },
  { id: "deepwiki_seeker", name: "知識の探求者", description: "Deep AI検索で10回以上検索", icon: "🔍", xp: 30, tier: "silver" },
  { id: "algorithm_sage", name: "アルゴリズム賢者", description: "全トピックの学習を完了", icon: "🧠", xp: 100, tier: "gold" },
  // 新アルゴリズム学習系（Phoenix/Thunder/Comparison）
  { id: "phoenix_basics", name: "Phoenix入門", description: "Phoenixの基礎を学習", icon: "🔥", xp: 30, tier: "silver" },
  { id: "phoenix_master", name: "Phoenix マスター", description: "Phoenixページを完全理解（3回以上閲覧）", icon: "🔥🏆", xp: 50, tier: "gold" },
  { id: "thunder_basics", name: "Thunder入門", description: "Thunderの基礎を学習", icon: "⚡", xp: 30, tier: "silver" },
  { id: "thunder_master", name: "Thunder マスター", description: "Thunderページを完全理解（3回以上閲覧）", icon: "⚡🏆", xp: 50, tier: "gold" },
  { id: "comparison_basics", name: "新旧比較入門", description: "新旧アルゴリズム比較を学習", icon: "📊", xp: 30, tier: "silver" },
  { id: "comparison_master", name: "比較分析マスター", description: "新旧比較ページを完全理解（3回以上閲覧）", icon: "📊🏆", xp: 50, tier: "gold" },
  { id: "new_algo_complete", name: "新アルゴリズム完全制覇", description: "Phoenix/Thunder/Comparisonを全て完了", icon: "🎓", xp: 100, tier: "platinum" },
  { id: "glossary_explorer", name: "用語集探検家", description: "用語集で10個以上の用語を閲覧", icon: "📖", xp: 20, tier: "bronze" },
];

const LEARNING_TOPICS = [
  // Free tier topics
  { id: "pipeline", name: "推薦パイプライン", description: "候補取得からランキングまでの全体フロー", plan: "FREE" },
  { id: "engagement", name: "エンゲージメント重み付け", description: "いいね・リプライ・リポストの重み", plan: "FREE" },
  { id: "velocity", name: "加速度とバイラル", description: "30分ウィンドウと拡散の仕組み", plan: "FREE" },
  { id: "filters", name: "フィルタリング", description: "安全性・多様性・品質フィルター", plan: "FREE" },
  // Standard tier topics
  { id: "heavy_ranker", name: "Heavy Ranker", description: "AIスコアリングの仕組み", plan: "PRO" },
  { id: "tweepcred", name: "TweepCred", description: "アカウント信頼度スコア", plan: "PRO" },
  { id: "simclusters", name: "SimClusters", description: "興味コミュニティの分類", plan: "PRO" },
  { id: "grok", name: "Grok統合", description: "AI品質評価と配信判定", plan: "PRO" },
  // 新アルゴリズム（Phoenix/Thunder/Comparison）
  { id: "phoenix", name: "Phoenix (Grok ML)", description: "Two-Tower + Transformer ランキング", plan: "FREE" },
  { id: "thunder", name: "Thunder (In-Network)", description: "超高速インメモリポストストア", plan: "FREE" },
  { id: "comparison", name: "新旧アルゴ比較", description: "Java/Scala → Rust/Python の進化", plan: "FREE" },
];

export async function GET() {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    // Get user stats
    const [postCount, commentCount, voteCount, simCount, userAchievements, learningProgress] = await Promise.all([
      prisma.forumPost.count({ where: { authorId: userId } }),
      prisma.comment.count({ where: { authorId: userId } }),
      prisma.vote.count({ where: { userId } }),
      prisma.simulation.count({ where: { userId } }),
      prisma.userAchievement.findMany({ where: { userId } }),
      prisma.learningProgress.findMany({ where: { userId } }),
    ]);

    // Check and award achievements
    const earned = userAchievements.map((a) => a.achievementId);
    const newAchievements: string[] = [];

    // Bronze tier
    if (!earned.includes("first_login")) newAchievements.push("first_login");
    if (postCount >= 1 && !earned.includes("first_post")) newAchievements.push("first_post");
    if (commentCount >= 1 && !earned.includes("first_comment")) newAchievements.push("first_comment");
    if (voteCount >= 1 && !earned.includes("first_vote")) newAchievements.push("first_vote");
    // Silver tier
    if (postCount >= 5 && !earned.includes("5_posts")) newAchievements.push("5_posts");
    if (commentCount >= 10 && !earned.includes("10_comments")) newAchievements.push("10_comments");
    if (voteCount >= 10 && !earned.includes("10_votes")) newAchievements.push("10_votes");
    if (simCount >= 5 && !earned.includes("simulator_pro")) newAchievements.push("simulator_pro");

    const verifiedPosts = await prisma.forumPost.count({ where: { authorId: userId, isVerified: true } });
    if (verifiedPosts >= 1 && !earned.includes("first_verification")) newAchievements.push("first_verification");
    // Gold tier
    if (postCount >= 20 && !earned.includes("20_posts")) newAchievements.push("20_posts");
    if (commentCount >= 50 && !earned.includes("community_builder")) newAchievements.push("community_builder");
    if (verifiedPosts >= 3 && !earned.includes("3_verifications")) newAchievements.push("3_verifications");

    // Check for popular post (any post with voteScore >= 10)
    const popularPost = await prisma.forumPost.findFirst({
      where: { authorId: userId },
      include: { votes: true },
    });
    if (popularPost && !earned.includes("popular_post")) {
      const score = popularPost.votes?.reduce((sum, v) => sum + v.value, 0) ?? 0;
      if (score >= 10) newAchievements.push("popular_post");
    }

    const completedTopics = learningProgress.filter((p) => p.completed).length;
    if (completedTopics >= LEARNING_TOPICS.length && !earned.includes("algorithm_sage")) {
      newAchievements.push("algorithm_sage");
    }

    // 新アルゴリズム学習系アチーブメント
    const phoenixProgress = learningProgress.find((p) => p.topicId === "phoenix");
    const thunderProgress = learningProgress.find((p) => p.topicId === "thunder");
    const comparisonProgress = learningProgress.find((p) => p.topicId === "comparison");

    if (phoenixProgress && phoenixProgress.viewCount >= 1 && !earned.includes("phoenix_basics")) {
      newAchievements.push("phoenix_basics");
    }
    if (phoenixProgress && phoenixProgress.viewCount >= 3 && !earned.includes("phoenix_master")) {
      newAchievements.push("phoenix_master");
    }
    if (thunderProgress && thunderProgress.viewCount >= 1 && !earned.includes("thunder_basics")) {
      newAchievements.push("thunder_basics");
    }
    if (thunderProgress && thunderProgress.viewCount >= 3 && !earned.includes("thunder_master")) {
      newAchievements.push("thunder_master");
    }
    if (comparisonProgress && comparisonProgress.viewCount >= 1 && !earned.includes("comparison_basics")) {
      newAchievements.push("comparison_basics");
    }
    if (comparisonProgress && comparisonProgress.viewCount >= 3 && !earned.includes("comparison_master")) {
      newAchievements.push("comparison_master");
    }

    // 新アルゴリズム完全制覇
    if (
      phoenixProgress?.completed &&
      thunderProgress?.completed &&
      comparisonProgress?.completed &&
      !earned.includes("new_algo_complete")
    ) {
      newAchievements.push("new_algo_complete");
    }

    // Award new achievements
    if (newAchievements.length > 0) {
      for (const achievementId of newAchievements) {
        await prisma.userAchievement.upsert({
          where: { userId_achievementId: { userId, achievementId } },
          create: { userId, achievementId },
          update: {},
        });
      }
    }

    const allEarned = [...earned, ...newAchievements];
    const totalXp = ACHIEVEMENTS
      .filter((a) => allEarned.includes(a.id))
      .reduce((sum, a) => sum + a.xp, 0);

    // Calculate level
    const level = Math.floor(totalXp / 50) + 1;

    return NextResponse.json({
      level,
      totalXp,
      nextLevelXp: level * 50,
      achievements: ACHIEVEMENTS.map((a) => ({
        ...a,
        unlocked: allEarned.includes(a.id),
        unlockedAt: userAchievements.find((ua) => ua.achievementId === a.id)?.unlockedAt,
      })),
      learningTopics: LEARNING_TOPICS.map((t) => {
        const progress = learningProgress.find((p) => p.topicId === t.id);
        return {
          ...t,
          completed: progress?.completed ?? false,
          viewCount: progress?.viewCount ?? 0,
          lastViewAt: progress?.lastViewAt,
        };
      }),
      stats: { postCount, commentCount, voteCount, simCount, verifiedPosts },
      newAchievements: newAchievements.map((id) => ACHIEVEMENTS.find((a) => a.id === id)),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
