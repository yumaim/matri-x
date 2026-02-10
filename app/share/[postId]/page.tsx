import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

const CATEGORY_LABELS: Record<string, string> = {
  ALGORITHM: "アルゴリズム解説",
  VERIFICATION: "現場検証",
  HEAVY_RANKER: "Heavy Ranker",
  SIMCLUSTERS: "SimClusters",
  TWEEPCRED: "TweepCred",
  STRATEGY: "戦略・Tips",
  UPDATES: "最新アップデート",
  QUESTIONS: "質問・相談",
};

interface Props {
  params: Promise<{ postId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params;

  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    include: { author: { select: { name: true } } },
  });

  if (!post) {
    return { title: "Not Found | matri-x" };
  }

  const category = CATEGORY_LABELS[post.category] ?? post.category;
  const description = post.content.slice(0, 200);
  const ogImageUrl = `${process.env.NEXTAUTH_URL ?? "https://matri-x-algo.wiki"}/api/og/${postId}`;

  return {
    title: `${post.title} | matri-x`,
    description,
    openGraph: {
      title: post.title,
      description,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
      type: "article",
      siteName: "matri-x",
      authors: [post.author.name ?? "匿名"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [ogImageUrl],
    },
    other: {
      "article:section": category,
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { postId } = await params;
  redirect(`/dashboard/forum/${postId}`);
}
