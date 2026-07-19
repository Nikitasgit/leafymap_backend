import { Types } from "mongoose";
import { User } from "@src/domain/entities/User.entity";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { UserPreferences } from "@src/domain/value-objects/UserPreferences.vo";

const mockObjectId = (): string => new Types.ObjectId().toString();

const buildUser = (
  overrides: Partial<Parameters<typeof User.reconstitute>[0]> = {}
) =>
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

describe("User moderation methods", () => {
  it("bans with temporary duration", () => {
    const now = new Date("2024-06-01T12:00:00.000Z");
    const user = buildUser();
    const banned = user.ban({ reason: "spam", duration: 3600000, now });

    expect(banned.bannedAt).toEqual(now);
    expect(banned.banReason).toBe("spam");
    expect(banned.banDuration).toBe(3600000);
    expect(banned.banExpiresAt).toEqual(new Date(now.getTime() + 3600000));
    expect(user.bannedAt).toBeUndefined();
  });

  it("bans permanently when duration is omitted", () => {
    const now = new Date("2024-06-01T12:00:00.000Z");
    const banned = buildUser().ban({ reason: "abuse", now });

    expect(banned.banReason).toBe("abuse");
    expect(banned.banDuration).toBeUndefined();
    expect(banned.banExpiresAt).toBeUndefined();
  });

  it("unbans by clearing ban fields", () => {
    const banned = buildUser().ban({ reason: "spam", duration: 1000 });
    const unbanned = banned.unban();

    expect(unbanned.bannedAt).toBeUndefined();
    expect(unbanned.banReason).toBeUndefined();
    expect(unbanned.banDuration).toBeUndefined();
    expect(unbanned.banExpiresAt).toBeUndefined();
  });

  it("soft deletes and restores", () => {
    const user = buildUser();
    const deleted = user.softDelete();
    expect(deleted.deleted).toBe(true);
    expect(user.deleted).toBe(false);

    const restored = deleted.restore();
    expect(restored.deleted).toBe(false);
  });
});
