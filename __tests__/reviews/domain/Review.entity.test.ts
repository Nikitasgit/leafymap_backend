import { Review } from "@src/domain/entities/Review.entity";
import {
  ReferenceId,
  ReviewId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ReviewReferenceType } from "@src/domain/value-objects/ReviewReferenceType.vo";
import { Types } from "mongoose";

describe("Review entity", () => {
  const authorId = UserId.from(new Types.ObjectId().toString());
  const otherUserId = UserId.from(new Types.ObjectId().toString());
  const referenceId = ReferenceId.from(new Types.ObjectId().toString());

  it("creates a review without an id", () => {
    const review = Review.create({
      authorId,
      rating: 4,
      comment: "Nice place",
      referenceId,
      referenceType: "Place",
    });

    expect(review.id).toBeNull();
    expect(review.authorId).toBe(authorId);
    expect(review.rating).toBe(4);
    expect(review.comment).toBe("Nice place");
    expect(review.referenceId).toBe(referenceId);
    expect(review.referenceType).toBe("Place");
    expect(review.certified).toBe(false);
    expect(review.deleted).toBe(false);
  });

  it("belongsTo returns true for the author", () => {
    const review = Review.reconstitute({
      id: ReviewId.from(new Types.ObjectId().toString()),
      authorId,
      rating: 5,
      comment: "Hello",
      referenceId,
      referenceType: "Event",
      certified: false,
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(review.belongsTo(authorId)).toBe(true);
    expect(review.belongsTo(otherUserId)).toBe(false);
  });

  it("updateRatingAndComment returns a new review with trimmed comment", () => {
    const review = Review.create({
      authorId,
      rating: 3,
      comment: "Original",
      referenceId,
      referenceType: "Place",
    });

    const updated = review.updateRatingAndComment({
      rating: 5,
      comment: "  Updated  ",
    });
    expect(updated.rating).toBe(5);
    expect(updated.comment).toBe("Updated");
    expect(review.rating).toBe(3);
    expect(review.comment).toBe("Original");
  });

  it("rejects invalid rating", () => {
    expect(() =>
      Review.create({
        authorId,
        rating: 6,
        referenceId,
        referenceType: "Place",
      })
    ).toThrow(
      expect.objectContaining({
        statusCode: 400,
      })
    );
  });

  it("rejects invalid reference types", () => {
    expect(() => ReviewReferenceType.from("Image")).toThrow(
      "Invalid review reference type"
    );
  });
});
