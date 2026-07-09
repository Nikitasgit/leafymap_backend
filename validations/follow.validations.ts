import { z } from "zod";

export const createFollowSchema = z.object({
  followingId: z.string().min(1, "Following ID is required"),
});

export const findOneFollowQuerySchema = z.object({
  follower: z.string().min(1, "follower query parameter is required"),
  following: z.string().min(1, "following query parameter is required"),
});
