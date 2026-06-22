import { z } from "zod";

/**
 * Schema for code submission payload
 */
export const submissionSchema = z.object({
  problemId: z.string().uuid("Invalid problem ID"),
  code: z.string().min(1, "Code cannot be empty").max(100000, "Code is too long"),
  language: z.string().min(1, "Language is required"),
  contestId: z.string().uuid().optional().nullable(),
});

/**
 * Schema for profile update payload
 */
export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50).optional(),
  bio: z.string().max(500).optional().nullable(),
  website: z.string().url("Invalid URL").or(z.literal("")).optional().nullable(),
  description: z.string().max(100).optional().nullable(),
  image: z.string().url().optional().nullable(),
  skills: z.array(z.string()).max(20).optional(),
});

/**
 * Schema for arcade score submission
 */
export const arcadeScoreSchema = z.object({
  gameId: z.enum(["BLITZ", "BUG_SNIPER", "BIG_O"]),
  score: z.number().min(0),
});
