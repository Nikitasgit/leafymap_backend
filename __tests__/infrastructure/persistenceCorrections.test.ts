import { Types } from "mongoose";
import {
  FOLLOWER_POPULATE,
  FOLLOWING_POPULATE,
} from "@src/infrastructure/repositories/MongooseFollowRepository";
import { REVIEW_AUTHOR_POPULATE } from "@src/infrastructure/repositories/MongooseReviewRepository";
import { COMMENT_AUTHOR_POPULATE } from "@src/infrastructure/repositories/MongooseCommentRepository";
import { PLACE_DETAILS_POPULATE } from "@src/infrastructure/repositories/MongoosePlaceRepository";
import { buildPartnershipUserQuery } from "@src/infrastructure/repositories/MongoosePartnershipRepository";
import { USER_DETAILS_QUERY_CONFIGS } from "@src/infrastructure/repositories/MongooseUserRepository";
import { EVENT_LIST_POPULATE } from "@src/infrastructure/repositories/MongooseEventRepository";
import { ReviewReadMapper } from "@src/infrastructure/read-mappers/Review.read-mapper";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { assertPersistedId } from "@src/infrastructure/persistence/utils/assertPersistedId";
import { buildSoftDeleteUpdate } from "@src/infrastructure/persistence/utils/buildSoftDeleteUpdate";

const expectNestedImageUrls = (
  populate: { populate?: unknown }
): void => {
  expect(populate.populate).toEqual(
    expect.objectContaining({ path: "image", select: "urls" })
  );
};

describe("persistence corrections", () => {
  it("populates image urls below follow, review and comment users", () => {
    expectNestedImageUrls(FOLLOWER_POPULATE);
    expectNestedImageUrls(FOLLOWING_POPULATE);
    expectNestedImageUrls(REVIEW_AUTHOR_POPULATE);
    expectNestedImageUrls(COMMENT_AUTHOR_POPULATE);
  });

  it("populates user image urls below place, user and event queries", () => {
    const placeUser = PLACE_DETAILS_POPULATE.find(
      (populate) => populate.path === "user"
    );
    expect(placeUser?.populate).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "image", select: "urls" }),
      ])
    );

    expect(USER_DETAILS_QUERY_CONFIGS.default.populate).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "image", select: "urls" }),
      ])
    );
    const eventUser = EVENT_LIST_POPULATE.find(
      (populate) => populate.path === "user"
    );
    expectNestedImageUrls(eventUser!);
  });

  it("keeps an explicit partnership status without forcing accepted", () => {
    const userId = UserId.from(new Types.ObjectId().toString());
    const query = buildPartnershipUserQuery({
      userId,
      status: "pending",
    });

    expect(query.status).toBe("pending");
    expect(query.$and).not.toEqual(
      expect.arrayContaining([{ status: "accepted" }])
    );
  });

  it("rejects an incomplete object review reference explicitly", () => {
    expect(() =>
      ReviewReadMapper.toListItem({
        _id: new Types.ObjectId(),
        author: null,
        rating: 4,
        reference: { location: { label: "Lyon" } },
        referenceType: "Place",
        certified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    ).toThrow("Review reference read model is missing id");
  });

  it("builds a restore update that unsets deletion metadata", () => {
    expect(buildSoftDeleteUpdate({ deleted: false })).toEqual({
      $set: { deleted: false },
      $unset: { deletedAt: 1, deletedBy: 1, deleteReason: 1 },
    });
  });

  it("throws an internal error when updating an unpersisted entity", () => {
    expect(() => assertPersistedId("place", undefined)).toThrow(
      "Cannot update place without id"
    );
  });
});
