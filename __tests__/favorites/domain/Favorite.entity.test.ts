import { Favorite } from "@src/domain/entities/Favorite.entity";
import {
  FavoriteId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { FavoriteReferenceType } from "@src/domain/value-objects/FavoriteReferenceType.vo";
import { Types } from "mongoose";

describe("Favorite entity", () => {
  const userId = UserId.from(new Types.ObjectId().toString());
  const otherUserId = UserId.from(new Types.ObjectId().toString());
  const referenceId = ReferenceId.from(new Types.ObjectId().toString());

  it("creates a favorite without an id", () => {
    const favorite = Favorite.create({
      userId,
      referenceId,
      referenceType: "Place",
    });

    expect(favorite.id).toBeNull();
    expect(favorite.userId).toBe(userId);
    expect(favorite.referenceId).toBe(referenceId);
    expect(favorite.referenceType).toBe("Place");
  });

  it("belongsTo returns true for the owner", () => {
    const favorite = Favorite.reconstitute({
      id: FavoriteId.from(new Types.ObjectId().toString()),
      userId,
      referenceId,
      referenceType: "Place",
      createdAt: new Date(),
    });

    expect(favorite.belongsTo(userId)).toBe(true);
    expect(favorite.belongsTo(otherUserId)).toBe(false);
  });

  it("rejects invalid reference types", () => {
    expect(() => FavoriteReferenceType.from("Invalid")).toThrow(
      "Invalid favorite reference type"
    );
  });
});
