import { Comment } from "@src/domain/entities/Comment.entity";
import {
  CommentId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { CommentReferenceType } from "@src/domain/value-objects/CommentReferenceType.vo";
import { Types } from "mongoose";

describe("Comment entity", () => {
  const authorId = UserId.from(new Types.ObjectId().toString());
  const otherUserId = UserId.from(new Types.ObjectId().toString());
  const referenceId = ReferenceId.from(new Types.ObjectId().toString());

  it("creates a comment without an id", () => {
    const comment = Comment.create({
      authorId,
      content: "Nice place",
      referenceId,
      referenceType: "Review",
    });

    expect(comment.id).toBeNull();
    expect(comment.authorId).toBe(authorId);
    expect(comment.content).toBe("Nice place");
    expect(comment.referenceId).toBe(referenceId);
    expect(comment.referenceType).toBe("Review");
    expect(comment.deleted).toBe(false);
  });

  it("belongsTo returns true for the author", () => {
    const comment = Comment.reconstitute({
      id: CommentId.from(new Types.ObjectId().toString()),
      authorId,
      content: "Hello",
      referenceId,
      referenceType: "Image",
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(comment.belongsTo(authorId)).toBe(true);
    expect(comment.belongsTo(otherUserId)).toBe(false);
  });

  it("updateContent returns a new comment with trimmed content", () => {
    const comment = Comment.create({
      authorId,
      content: "Original",
      referenceId,
      referenceType: "Review",
    });

    const updated = comment.updateContent("  Updated  ");
    expect(updated.content).toBe("Updated");
    expect(comment.content).toBe("Original");
  });

  it("rejects empty content", () => {
    expect(() =>
      Comment.create({
        authorId,
        content: "   ",
        referenceId,
        referenceType: "Review",
      })
    ).toThrow(
      expect.objectContaining({
        statusCode: 400,
      })
    );
  });

  it("rejects invalid reference types", () => {
    expect(() => CommentReferenceType.from("Place")).toThrow(
      "Invalid comment reference type"
    );
  });
});
