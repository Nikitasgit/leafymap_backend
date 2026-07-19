import { z } from "zod";
import { isValidObjectId } from "@src/api/http/objectId";

const objectIdString = (message: string) =>
  z.string().min(1, message).refine(isValidObjectId, { message: "Invalid ID" });

export const createFollowSchema = z.object({
  followingId: objectIdString("Following ID is required"),
});

export const getOneFollowQuerySchema = z.object({
  follower: objectIdString("follower query parameter is required"),
  following: objectIdString("following query parameter is required"),
});
