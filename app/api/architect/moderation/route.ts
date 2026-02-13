import { NextRequest, NextResponse } from "next/server";
import { requireAdminOrModerator, handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { z } from "zod";

// GET /api/architect/moderation — list posts/comments for moderation
export async function GET(request: NextRequest) {
    try {
        await requireAdminOrModerator();
        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type") ?? "posts"; // posts | comments
        const userId = searchParams.get("userId");
        const postId = searchParams.get("postId");
        const page = parseInt(searchParams.get("page") ?? "1");
        const search = searchParams.get("search") ?? "";
        const limit = 20;
        const skip = (page - 1) * limit;

        if (type === "comments") {
            const where: Record<string, unknown> = {};
            if (userId) where.authorId = userId;
            if (postId) where.postId = postId;
            if (search) where.content = { contains: search };

            const [comments, total] = await Promise.all([
                prisma.comment.findMany({
                    where,
                    orderBy: { createdAt: "desc" },
                    take: limit,
                    skip,
                    include: {
                        author: { select: { id: true, name: true, image: true, role: true } },
                        post: { select: { id: true, title: true } },
                    },
                }),
                prisma.comment.count({ where }),
            ]);

            return NextResponse.json({ comments, total, page, totalPages: Math.ceil(total / limit) });
        }

        // Default: posts
        const where: Record<string, unknown> = {};
        if (userId) where.authorId = userId;
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { content: { contains: search } },
            ];
        }

        const [posts, total] = await Promise.all([
            prisma.forumPost.findMany({
                where,
                orderBy: { createdAt: "desc" },
                take: limit,
                skip,
                include: {
                    author: { select: { id: true, name: true, image: true, role: true } },
                    _count: { select: { comments: true, votes: true } },
                },
            }),
            prisma.forumPost.count({ where }),
        ]);

        return NextResponse.json({ posts, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        return handleApiError(error);
    }
}

const moderationSchema = z.object({
    action: z.enum(["deletePost", "deleteComment", "alert"]),
    targetId: z.string(),
    message: z.string().max(500).optional(),
});

// POST /api/architect/moderation — delete or alert
export async function POST(request: NextRequest) {
    try {
        const session = await requireAdminOrModerator();
        const body = await request.json();
        const data = moderationSchema.parse(body);

        switch (data.action) {
            case "deletePost": {
                const post = await prisma.forumPost.findUnique({
                    where: { id: data.targetId },
                    select: { title: true, authorId: true },
                });
                if (!post) {
                    return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 });
                }

                await prisma.forumPost.delete({ where: { id: data.targetId } });

                await logAudit({
                    actorId: session.user.id,
                    action: "DELETE_POST",
                    targetId: data.targetId,
                    targetType: "POST",
                    details: `投稿削除: ${post.title}`,
                });

                // Notify the author
                if (post.authorId) {
                    await prisma.notification.create({
                        data: {
                            userId: post.authorId,
                            type: "SYSTEM",
                            message: data.message
                                ? `あなたの投稿「${post.title}」がモデレーターにより削除されました。理由: ${data.message}`
                                : `あなたの投稿「${post.title}」がモデレーターにより削除されました。`,
                        },
                    });
                }

                return NextResponse.json({ success: true, action: "deletePost" });
            }

            case "deleteComment": {
                const comment = await prisma.comment.findUnique({
                    where: { id: data.targetId },
                    select: { content: true, authorId: true, post: { select: { title: true } } },
                });
                if (!comment) {
                    return NextResponse.json({ error: "コメントが見つかりません" }, { status: 404 });
                }

                await prisma.comment.delete({ where: { id: data.targetId } });

                await logAudit({
                    actorId: session.user.id,
                    action: "DELETE_COMMENT",
                    targetId: data.targetId,
                    targetType: "POST",
                    details: `コメント削除: ${comment.content.slice(0, 50)}...`,
                });

                // Notify the author
                if (comment.authorId) {
                    await prisma.notification.create({
                        data: {
                            userId: comment.authorId,
                            type: "SYSTEM",
                            message: data.message
                                ? `「${comment.post.title}」へのコメントがモデレーターにより削除されました。理由: ${data.message}`
                                : `「${comment.post.title}」へのコメントがモデレーターにより削除されました。`,
                        },
                    });
                }

                return NextResponse.json({ success: true, action: "deleteComment" });
            }

            case "alert": {
                // Find the post or comment to get the author
                const post = await prisma.forumPost.findUnique({
                    where: { id: data.targetId },
                    select: { authorId: true, title: true },
                });

                if (!post) {
                    return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 });
                }

                const alertMessage = data.message ?? "モデレーターからの通知があります。投稿内容をご確認ください。";

                await prisma.notification.create({
                    data: {
                        userId: post.authorId,
                        type: "MODERATOR_ALERT",
                        message: `【モデレーター通知】「${post.title}」について: ${alertMessage}`,
                        postId: data.targetId,
                        link: `/dashboard/forum/${data.targetId}`,
                    },
                });

                await logAudit({
                    actorId: session.user.id,
                    action: "MODERATOR_ALERT",
                    targetId: data.targetId,
                    targetType: "POST",
                    details: `アラート送信: ${alertMessage}`,
                });

                return NextResponse.json({ success: true, action: "alert" });
            }
        }
    } catch (error) {
        return handleApiError(error);
    }
}
