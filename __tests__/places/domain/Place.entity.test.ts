import { Types } from "mongoose";
import { Place } from "@src/domain/entities/Place.entity";
import {
  PlaceCategoryId,
  PlaceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { PlaceLocation } from "@src/domain/value-objects/PlaceLocation.vo";

const mockObjectId = (): string => new Types.ObjectId().toString();

const location = PlaceLocation.from({
  type: "Point",
  coordinates: [2.3522, 48.8566],
  label: "Paris",
  id: "paris",
});

describe("Place entity", () => {
  it("creates a place owned by the user", () => {
    const userId = UserId.from(mockObjectId());
    const placeCategoryId = PlaceCategoryId.from(mockObjectId());

    const place = Place.create({
      userId,
      location,
      placeCategoryId,
    });

    expect(place.id).toBeNull();
    expect(place.belongsTo(userId)).toBe(true);
    expect(place.belongsTo(UserId.from(mockObjectId()))).toBe(false);
    expect(place.rating).toBe(0);
    expect(place.deleted).toBe(false);
  });

  it("updates details immutably", () => {
    const userId = UserId.from(mockObjectId());
    const place = Place.reconstitute({
      id: PlaceId.from(mockObjectId()),
      userId,
      location,
      placeCategoryId: PlaceCategoryId.from(mockObjectId()),
      defaultSchedule: {} as never,
      customDates: [],
      rating: 4,
      deleted: false,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    });

    const newCategoryId = PlaceCategoryId.from(mockObjectId());
    const updated = place.updateDetails({ placeCategoryId: newCategoryId });

    expect(updated.placeCategoryId).toBe(newCategoryId);
    expect(updated.location).toEqual(location);
    expect(place.placeCategoryId).not.toBe(newCategoryId);
  });
});
