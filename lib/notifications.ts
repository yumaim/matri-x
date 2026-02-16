import { prisma } from "@/lib/db";

/**
 * Create a notification for a user
 */
export async function createNotification({
  userId,
  type,
  message,
  postId,
  link,
}: {
  userId: string;
  type: string;
  message: string;
  postId?: string;
  link?: string;
}) {
  try {
    await prisma.notification.create({
      data: { userId, type, message: message.slice(0, 200), postId, link },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

/**
 * Notify post author when someone comments on their post
 */
export async function notifyOnComment({
  postId,
  commentAuthorId,
  commentAuthorName,
  postTitle,
}: {
  postId: string;
  commentAuthorId: string;
  commentAuthorName: string;
  postTitle: string;
}) {
  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });
  if (!post || post.authorId === commentAuthorId) return; // Don't notify self

  await createNotification({
    userId: post.authorId,
    type: "COMMENT",
    message: `${commentAuthorName}さんがあなたの投稿「${postTitle.slice(0, 30)}${postTitle.length > 30 ? "..." : ""}」にコメントしました`,
    postId,
    link: `/dashboard/forum/${postId}`,
  });
}

/**
 * Notify comment author when someone replies to their comment
 */
export async function notifyOnReply({
  postId,
  parentCommentId,
  replyAuthorId,
  replyAuthorName,
}: {
  postId: string;
  parentCommentId: string;
  replyAuthorId: string;
  replyAuthorName: string;
}) {
  const parentComment = await prisma.comment.findUnique({
    where: { id: parentCommentId },
    select: { authorId: true },
  });
  if (!parentComment || parentComment.authorId === replyAuthorId) return;

  await createNotification({
    userId: parentComment.authorId,
    type: "COMMENT",
    message: `${replyAuthorName}さんがあなたのコメントに返信しました`,
    postId,
    link: `/dashboard/forum/${postId}`,
  });
}

/**
 * Notify post author when someone upvotes their post
 */
export async function notifyOnPostVote({
  postId,
  voterId,
  voterName,
  postTitle,
  value,
}: {
  postId: string;
  voterId: string;
  voterName: string;
  postTitle: string;
  value: number;
}) {
  if (value < 1) return; // Only notify on upvotes
  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });
  if (!post || post.authorId === voterId) return;

  await createNotification({
    userId: post.authorId,
    type: "VOTE",
    message: `${voterName}さんがあなたの投稿「${postTitle.slice(0, 30)}${postTitle.length > 30 ? "..." : ""}」に👍しました`,
    postId,
    link: `/dashboard/forum/${postId}`,
  });
}

/**
 * Notify all users about an update (algorithm/feature/announcement) (batched)
 */
export async function notifyAlgorithmUpdate({
  title,
  impact,
  updateId,
  type = "ALGORITHM_UPDATE",
}: {
  title: string;
  impact: string;
  updateId: string;
  type?: "ALGORITHM_UPDATE" | "FEATURE_UPDATE" | "ANNOUNCEMENT";
}) {
  // タイプに応じたプレフィックスとアイコン
  let prefix = "";
  if (type === "ALGORITHM_UPDATE") {
    const impactLabel =
      impact === "CRITICAL"
        ? "🔴 緊急"
        : impact === "HIGH"
        ? "🟠 重要"
        : impact === "MEDIUM"
        ? "🟡 注目"
        : "🟢 観察";
    prefix = `${impactLabel} アルゴリズム更新`;
  } else if (type === "FEATURE_UPDATE") {
    prefix = "✨ 新機能";
  } else {
    prefix = "📢 お知らせ";
  }

  const message = `${prefix}: ${title}`;
  const link = `/dashboard/updates#${updateId}`;

  const BATCH_SIZE = 500;
  let skip = 0;

  while (true) {
    const users = await prisma.user.findMany({
      select: { id: true },
      take: BATCH_SIZE,
      skip,
    });
    if (users.length === 0) break;

    await prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        type,
        message,
        link,
      })),
    });

    if (users.length < BATCH_SIZE) break;
    skip += BATCH_SIZE;
  }
}
