import { z } from "zod";

export const WHISPER_EMOJIS = ["🔥", "👏", "💡", "🎯"] as const;

export const createWhisperSchema = z.object({
  content: z
    .string()
    .min(1, "囁きを入力してください")
    .max(280, "囁きは280文字以内で入力してください"),
});

export const whisperQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const whisperReactionSchema = z.object({
  emoji: z.enum(WHISPER_EMOJIS, {
    errorMap: () => ({ message: "無効なリアクションです" }),
  }),
});

export type CreateWhisperInput = z.infer<typeof createWhisperSchema>;
export type WhisperQueryInput = z.infer<typeof whisperQuerySchema>;
export type WhisperReactionInput = z.infer<typeof whisperReactionSchema>;
