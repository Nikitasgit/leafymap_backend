import { Types } from "mongoose";
import { Image } from "@src/domain/entities/Image.entity";
import {
  ImageId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ImageReferenceType } from "@src/domain/value-objects/ImageReferenceType.vo";
import { ImageType } from "@src/domain/value-objects/ImageType.vo";

const mockObjectId = (): string => new Types.ObjectId().toString();

const urls = {
  original: "https://example.com/original.jpg",
  thumbnail: "https://example.com/thumb.jpg",
  medium: "https://example.com/medium.jpg",
};

describe("Image entity", () => {
  const userId = UserId.from(mockObjectId());
  const referenceId = ReferenceId.from(mockObjectId());

  it("creates an image without id", () => {
    const image = Image.create({
      userId,
      referenceId,
      referenceType: ImageReferenceType.from("Place"),
      type: ImageType.from("gallery"),
      urls,
      originalName: "photo.jpg",
      size: 1024,
      mimetype: "image/jpeg",
    });

    expect(image.id).toBeNull();
    expect(image.userId).toBe(userId);
    expect(image.deleted).toBe(false);
    expect(image.belongsTo(userId)).toBe(true);
  });

  it("reconstitutes an image", () => {
    const id = ImageId.from(mockObjectId());
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    const updatedAt = new Date("2026-01-02T00:00:00.000Z");

    const image = Image.reconstitute({
      id,
      userId,
      referenceId,
      referenceType: ImageReferenceType.from("Event"),
      type: ImageType.from("cover"),
      urls,
      originalName: "cover.jpg",
      size: 2048,
      mimetype: "image/jpeg",
      deleted: true,
      deletedAt: updatedAt,
      deletedBy: userId,
      deleteReason: "moderation",
      createdAt,
      updatedAt,
    });

    expect(image.id).toBe(id);
    expect(image.deleted).toBe(true);
    expect(image.deleteReason).toBe("moderation");
  });

  it("belongsTo returns false for another user", () => {
    const image = Image.create({
      userId,
      referenceId,
      referenceType: ImageReferenceType.from("User"),
      type: ImageType.from("profile"),
      urls,
      originalName: "avatar.jpg",
      size: 512,
      mimetype: "image/png",
    });

    expect(image.belongsTo(UserId.from(mockObjectId()))).toBe(false);
  });
});
