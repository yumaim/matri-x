import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createPostSchema, postsQuerySchema } from "@/lib/validations/forum";
import { checkRateLimit } from "@/lib/rate-limit";

// GET /api/forum/posts — 投稿一覧
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);

    const query = postsQuerySchema.parse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      tag: searchParams.get("tag") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
      authorId: searchParams.get("authorId") ?? undefined,
      bookmarked: searchParams.get("bookmarked") ?? undefined,
    });

    const where: Record<string, unknown> = {
      status: "PUBLISHED",
    };

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { content: { contains: query.search } },
      ];
    }

    if (query.tag) {
      where.tags = { contains: query.tag };
    }

    if (query.authorId) {
      where.authorId = query.authorId;
    }

    if (query.bookmarked && session?.user?.id) {
      where.bookmarks = {
        some: { userId: session.user.id },
      };
    }

    let orderBy: Record<string, unknown> = { createdAt: "desc" };
    if (query.sort === "popular") {
      orderBy = { viewCount: "desc" };
    } else if (query.sort === "most_voted") {
      orderBy = { votes: { _count: "desc" } };
    } else if (query.sort === "most_commented") {
      orderBy = { comments: { _count: "desc" } };
    }

    const skip = (query.page - 1) * query.limit;

    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        orderBy: [
          { isPinned: "desc" },
          orderBy,
        ],
        skip,
        take: query.limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true,
              company: true,
              xHandle: true,
            },
          },
          _count: {
            select: {
              comments: true,
              votes: true,
              bookmarks: true,
              evidence: true,
            },
          },
          votes: session?.user?.id
            ? {
                where: { userId: session.user.id },
                select: { value: true },
              }
            : false,
          bookmarks: session?.user?.id
            ? {
                where: { userId: session.user.id },
                select: { id: true },
              }
            : false,
        },
      }),
      prisma.forumPost.count({ where }),
    ]);

    // Calculate vote scores and transform
    const transformedPosts = posts.map((post) => {
      const tags = (() => {
        try {
          return JSON.parse(post.tags);
        } catch {
          return [];
        }
      })();

      return {
        ...post,
        tags,
        voteScore: 0, // will be computed below
        userVote: post.votes?.[0]?.value ?? null,
        isBookmarked: (post.bookmarks?.length ?? 0) > 0,
      };
    });

    // Get vote scores
    const postIds = posts.map((p) => p.id);
    if (postIds.length > 0) {
      const voteSums = await prisma.vote.groupBy({
        by: ["postId"],
        where: { postId: { in: postIds } },
        _sum: { value: true },
      });
      const voteMap = new Map(voteSums.map((v) => [v.postId, v._sum.value ?? 0]));
      transformedPosts.forEach((p) => {
        p.voteScore = voteMap.get(p.id) ?? 0;
      });
    }

    return NextResponse.json({
      posts: transformedPosts,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    console.error("GET /api/forum/posts error:", error);
    return NextResponse.json(
      { error: "投稿一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}

// POST /api/forum/posts — 新規投稿
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { allowed } = checkRateLimit(`post:${session.user.id}`, 10, 60000);
    if (!allowed) {
      return NextResponse.json({ error: "リクエストが多すぎます。しばらく待ってから再試行してください。" }, { status: 429 });
    }

    const body = await request.json();
    const data = createPostSchema.parse(body);

    // MURMUR (つぶやき): 1 post per user per day (JST)
    if (data.category === "MURMUR") {
      const jstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
      const todayStart = new Date(jstNow.getFullYear(), jstNow.getMonth(), jstNow.getDate());
      const todayStartUTC = new Date(todayStart.getTime() - 9 * 60 * 60 * 1000);
      const todayEndUTC = new Date(todayStartUTC.getTime() + 24 * 60 * 60 * 1000);
      const existing = await prisma.forumPost.count({
        where: {
          authorId: session.user.id,
          category: "MURMUR",
          createdAt: { gte: todayStartUTC, lt: todayEndUTC },
          status: { not: "REMOVED" },
        },
      });
      if (existing > 0) {
        return NextResponse.json(
          { error: "つぶやきは1日1回までです。明日またお待ちしています！" },
          { status: 429 }
        );
      }
    }

    // Sanitize user content (H-7)
    const { sanitizeContent } = await import("@/lib/sanitize");

    const post = await prisma.forumPost.create({
      data: {
        title: sanitizeContent(data.title),
        content: sanitizeContent(data.content),
        category: data.category,
        tags: JSON.stringify(data.tags),
        status: data.status,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
            company: true,
            xHandle: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        ...post,
        tags: data.tags,
        voteScore: 0,
        userVote: null,
        isBookmarked: false,
        _count: { comments: 0, votes: 0, bookmarks: 0, evidence: 0 },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "バリデーションエラー", details: error }, { status: 400 });
    }
    console.error("POST /api/forum/posts error:", error);
    return NextResponse.json(
      { error: "投稿の作成に失敗しました" },
      { status: 500 }
    );
  }
}
