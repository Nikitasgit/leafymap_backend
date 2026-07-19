import { Types } from "mongoose";
import { User } from "@src/domain/entities/User.entity";
import {
  PlaceId,
  UserCategoryId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { UserPreferences } from "@src/domain/value-objects/UserPreferences.vo";

const mockObjectId = (): string => new Types.ObjectId().toString();

const buildUser = (overrides: Partial<Parameters<typeof User.reconstitute>[0]> = {}) =>
  User.reconstitute({
    id: UserId.from(mockObjectId()),
    email: "user@example.com",
    userType: "guest",
    role: "user",
    deleted: false,
    followers: 0,
    interestIds: [],
    preferences: UserPreferences.from({}),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  });

describe("User entity", () => {
  it("updates profile immutably", () => {
    const user = buildUser({ username: "old" });
    const updated = user.updateProfile({
      username: "new",
      userType: "creator",
      userCategoryId: UserCategoryId.from(mockObjectId()),
    });

    expect(updated.username).toBe("new");
    expect(updated.userType).toBe("creator");
    expect(user.username).toBe("old");
    expect(user.userType).toBe("guest");
  });

  it("links and unlinks a place", () => {
    const user = buildUser();
    const placeId = PlaceId.from(mockObjectId());

    const linked = user.linkPlace(placeId);
    expect(linked.hasPlace()).toBe(true);
    expect(linked.placeId).toBe(placeId);

    const unlinked = linked.unlinkPlace();
    expect(unlinked.hasPlace()).toBe(false);
    expect(unlinked.placeId).toBeUndefined();
  });
});
