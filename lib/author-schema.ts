import { z } from "zod";

export const authorSchema = z.object({
  name: z.string().min(1).max(60),
  avatar_url: z.string().url().nullable().optional(),
  tags: z.array(z.string().min(1).max(24)).max(8).default([]),
  sales_count: z.number().int().nonnegative().default(0),
  rating: z.number().min(0).max(5).default(0),
  review_count: z.number().int().nonnegative().default(0),
  is_anonymous: z.boolean().default(false),
  is_default: z.boolean().default(false),
});
