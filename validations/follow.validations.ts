import { z } from "zod";

export const createFollowSchema = z.object({
  followingId: z.string().min(1, "Following ID is required"),
});

export type CreateFollowInput = z.infer<typeof createFollowSchema>;
