import { NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

const ACHIEVEMENTS = [
  { id: "first_login", name: "はじめの一歩", description: "matri-xに初めてログイン", icon: "🎯", xp: 10 },
  { id: "first_post", name: "発言者", description: "フォーラムに初投稿", icon: "💬", xp: 20 },
  { id: "5_posts", name: "常連メンバー", description: "フォーラムに5件投稿", icon: "📝", xp: 50 },
  { id: "first_verification", name: "検証者", description: "初めての検証レポート", icon: "🔬", xp: 30 },
  { id: "10_votes", name: "目利き", description: "10件以上の投票", icon: "👁️", xp: 20 },
  { id: "pipeline_master", name: "パイプラインマスター", description: "パイプライン探索を全セクション閲覧", icon: "🔧", xp: 40 },
  { id: "simulator_pro", name: "シミュレーター達人", description: "シミュレーターを5回以上使用", icon: "🧮", xp: 30 },
  { id: "deepwiki_seeker", name: "知識の探求者", description: "DeepWikiで10回以上検索", icon: "🔍", xp: 30 },
  { id: "community_builder", name: "コミュニティビルダー", description: "20件以上のコメント", icon: "🤝", xp: 50 },
  { id: "algorithm_sage", name: "アルゴリズム賢者", description: "全トピックの学習を完了", icon: "🧠", xp: 100 },
];

const LEARNING_TOPICS = [
  { id: "pipeline", name: "推薦パイプライン", description: "候補取得からランキングまでの全体フロー" },
  { id: "heavy_ranker", name: "Heavy Ranker", description: "AIスコアリングの仕組み" },
  { id: "engagement", name: "エンゲージメント重み付け", description: "いいね・リプライ・リポストの重み" },
  { id: "tweepcred", name: "TweepCred", description: "アカウント信頼度スコア" },
  { id: "simclusters", name: "SimClusters", description: "興味コミュニティの分類" },
  { id: "velocity", name: "加速度とバイラル", description: "30分ウィンドウと拡散の仕組み" },
  { id: "grok", name: "Grok統合", description: "AI品質評価と配信判定" },
  { id: "filters", name: "フィルタリング", description: "安全性・多様性・品質フィルター" },
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

    if (!earned.includes("first_login")) newAchievements.push("first_login");
    if (postCount >= 1 && !earned.includes("first_post")) newAchievements.push("first_post");
    if (postCount >= 5 && !earned.includes("5_posts")) newAchievements.push("5_posts");
    if (voteCount >= 10 && !earned.includes("10_votes")) newAchievements.push("10_votes");
    if (commentCount >= 20 && !earned.includes("community_builder")) newAchievements.push("community_builder");
    if (simCount >= 5 && !earned.includes("simulator_pro")) newAchievements.push("simulator_pro");

    const verifiedPosts = await prisma.forumPost.count({ where: { authorId: userId, isVerified: true } });
    if (verifiedPosts >= 1 && !earned.includes("first_verification")) newAchievements.push("first_verification");

    const completedTopics = learningProgress.filter((p) => p.completed).length;
    if (completedTopics >= LEARNING_TOPICS.length && !earned.includes("algorithm_sage")) {
      newAchievements.push("algorithm_sage");
    }

    // Award new achievements
    if (newAchievements.length > 0) {
      await prisma.userAchievement.createMany({
        data: newAchievements.map((id) => ({ userId, achievementId: id })),
        skipDuplicates: true,
      });
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
