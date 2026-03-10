import { z } from "zod";

export const POST_CATEGORIES = [
  "ALGORITHM",
  "VERIFICATION",
  "STRATEGY",
  "UPDATES",
  "QUESTIONS",
] as const;

export const EVIDENCE_TYPES = [
  "IMPRESSION_TEST",
  "ENGAGEMENT_TEST",
  "TIMING_TEST",
  "CONTENT_TEST",
  "HASHTAG_TEST",
  "OTHER",
] as const;

export const POST_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "FLAGGED",
  "REMOVED",
] as const;

export const SORT_OPTIONS = ["latest", "popular", "most_voted", "most_commented"] as const;

export const createPostSchema = z.object({
  title: z
    .string()
    .min(3, "タイトルは3文字以上で入力してください")
    .max(200, "タイトルは200文字以内で入力してください"),
  content: z
    .string()
    .min(10, "内容は10文字以上で入力してください")
    .max(50000, "内容は50000文字以内で入力してください"),
  category: z.enum(POST_CATEGORIES, {
    errorMap: () => ({ message: "カテゴリを選択してください" }),
  }),
  tags: z
    .array(z.string().max(30))
    .max(10, "タグは最大10個まで設定できます")
    .default([]),
  status: z.enum(POST_STATUSES).default("PUBLISHED"),
});

export const updatePostSchema = createPostSchema.partial();

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "コメントを入力してください")
    .max(5000, "コメントは5000文字以内で入力してください"),
  parentId: z.string().nullish(),
});

export const createEvidenceSchema = z.object({
  type: z.enum(EVIDENCE_TYPES, {
    errorMap: () => ({ message: "検証タイプを選択してください" }),
  }),
  description: z
    .string()
    .min(10, "説明は10文字以上で入力してください")
    .max(10000, "説明は10000文字以内で入力してください"),
  beforeData: z.any().optional(),
  afterData: z.any().optional(),
  conclusion: z
    .string()
    .max(5000, "結論は5000文字以内で入力してください")
    .optional(),
});

export const voteSchema = z.object({
  value: z.union([z.literal(1), z.literal(-1)]),
});

export const postsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  category: z.enum(POST_CATEGORIES).optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(SORT_OPTIONS).default("latest"),
  authorId: z.string().optional(),
  bookmarked: z.coerce.boolean().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CreateEvidenceInput = z.infer<typeof createEvidenceSchema>;
export type VoteInput = z.infer<typeof voteSchema>;
export type PostsQueryInput = z.infer<typeof postsQuerySchema>;
