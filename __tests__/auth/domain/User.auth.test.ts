import { Types } from "mongoose";
import { User } from "@src/domain/entities/User.entity";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { UserPreferences } from "@src/domain/value-objects/UserPreferences.vo";
import { ERROR_CODES } from "@src/shared/errors";

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
    passwordHash: "hash",
    emailVerified: true,
    acceptedCGU: true,
    acceptedAt: new Date(),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  });

describe("User auth domain", () => {
  it("registers a guest with email verification pending", () => {
    const user = User.register({
      email: "new@test.com",
      passwordHash: "hashed",
      acceptedCGU: true,
      emailNotifications: true,
      emailVerificationTokenHash: "token-hash",
      emailVerificationExpiresAt: new Date(Date.now() + 60_000),
    });

    expect(user.id).toBeNull();
    expect(user.emailVerified).toBe(false);
    expect(user.userType).toBe("guest");
    expect(user.preferences.emailNotifications).toBe(true);
    expect(user.emailVerificationTokenHash).toBe("token-hash");
  });

  it("rejects authentication when email is not verified", () => {
    const user = buildUser({ emailVerified: false });

    expect(() =>
      user.assertCanAuthenticate({ requireEmailVerified: true })
    ).toThrow(
      expect.objectContaining({
        code: ERROR_CODES.AUTH_EMAIL_NOT_VERIFIED,
        statusCode: 403,
      })
    );
  });

  it("rejects authentication for an active ban", () => {
    const user = buildUser({
      bannedAt: new Date(),
      banReason: "Spam",
      banExpiresAt: new Date(Date.now() + 60_000),
    });

    expect(() => user.assertCanAuthenticate()).toThrow(
      expect.objectContaining({
        code: ERROR_CODES.AUTH_USER_BANNED,
        statusCode: 403,
      })
    );
  });

  it("verifies email and clears verification tokens", () => {
    const user = buildUser({
      emailVerified: false,
      emailVerificationTokenHash: "hash",
      emailVerificationExpiresAt: new Date(),
    });

    const verified = user.verifyEmail();
    expect(verified.emailVerified).toBe(true);
    expect(verified.emailVerificationTokenHash).toBeUndefined();
    expect(verified.emailVerificationExpiresAt).toBeUndefined();
  });

  it("merges an unverified account with Google", () => {
    const user = buildUser({ emailVerified: false });
    const merged = user.mergeUnverifiedWithGoogle({
      googleId: "google-1",
      passwordHash: "new-hash",
      googlePictureUrl: "https://example.com/pic.jpg",
    });

    expect(merged.googleId).toBe("google-1");
    expect(merged.emailVerified).toBe(true);
    expect(merged.passwordHash).toBe("new-hash");
    expect(merged.emailVerificationTokenHash).toBeUndefined();
  });
});
