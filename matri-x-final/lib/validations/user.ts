import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  company: z.string().max(100).optional().or(z.literal("")),
  bio: z.string().max(500).optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  xHandle: z.string().max(50).optional().or(z.literal("")),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).regex(/^(?=.*[a-zA-Z])(?=.*\d)/, "英字と数字を含めてください"),
});
