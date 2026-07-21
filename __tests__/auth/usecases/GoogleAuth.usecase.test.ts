import { Types } from "mongoose";
import GoogleAuthUseCase from "@src/application/usecases/auth/GoogleAuth.usecase";
import { User } from "@src/domain/entities/User.entity";
import { IGoogleIdentityVerifier } from "@src/domain/interfaces/IGoogleIdentityVerifier";
import { IJwtTokenIssuer } from "@src/domain/interfaces/IJwtTokenIssuer";
import { IPasswordHasher } from "@src/domain/interfaces/IPasswordHasher";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { UserPreferences } from "@src/domain/value-objects/UserPreferences.vo";

const objectId = (): string => new Types.ObjectId().toString();

const reconstituteUser = (
  overrides: Partial<Parameters<typeof User.reconstitute>[0]> = {}
): User =>
  User.reconstitute({
    id: UserId.from(objectId()),
    email: "alice@example.com",
    passwordHash: "old-hash",
    userType: "guest",
    role: "user",
    deleted: false,
    followers: 0,
    interestIds: [],
    acceptedCGU: false,
    emailVerified: true,
    preferences: UserPreferences.from({ emailNotifications: false }),
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  });

const createRepository = (): jest.Mocked<IUserRepository> => ({
  create: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByEmailOrUsername: jest.fn(),
  findByGoogleId: jest.fn(),
  findByEmailVerificationTokenHash: jest.fn(),
  findByResetPasswordTokenHash: jest.fn(),
  findDetailsById: jest.fn(),
  findList: jest.fn(),
  findAdminByEmail: jest.fn(),
  incrementFollowers: jest.fn(),
  deleteOne: jest.fn(),
  linkPlace: jest.fn(),
  unlinkPlace: jest.fn(),
});

describe("GoogleAuthUseCase", () => {
  let repository: jest.Mocked<IUserRepository>;
  let verifier: jest.Mocked<IGoogleIdentityVerifier>;
  let hasher: jest.Mocked<IPasswordHasher>;
  let tokenIssuer: jest.Mocked<IJwtTokenIssuer>;
  let useCase: GoogleAuthUseCase;

  beforeEach(() => {
    repository = createRepository();
    verifier = { verifyIdToken: jest.fn() };
    hasher = { hash: jest.fn(), compare: jest.fn() };
    tokenIssuer = { issue: jest.fn(), verify: jest.fn() };
    useCase = new GoogleAuthUseCase(
      repository,
      verifier,
      hasher,
      tokenIssuer
    );
    verifier.verifyIdToken.mockResolvedValue({
      email: "alice@example.com",
      googleId: "google-123",
      picture: "avatar.jpg",
      givenName: "Alice",
      familyName: "Martin",
    });
    tokenIssuer.issue.mockReturnValue("jwt");
  });

  it("logs in an account already linked to Google", async () => {
    const user = reconstituteUser({ googleId: "google-123" });
    repository.findByGoogleId.mockResolvedValue(user);
    repository.findById.mockResolvedValue(user);

    const result = await useCase.execute({ idToken: "credential" });

    expect(repository.findByEmail).not.toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({ lastLogin: expect.any(Date) })
    );
    expect(tokenIssuer.issue).toHaveBeenCalledWith({
      id: user.id,
      userType: "guest",
      role: "user",
    });
    expect(result).toMatchObject({ token: "jwt", user: { id: user.id } });
  });

  it("merges an unverified password account and clears verification data", async () => {
    const user = reconstituteUser({
      emailVerified: false,
      emailVerificationTokenHash: "verification-hash",
      emailVerificationExpiresAt: new Date("2027-01-01"),
    });
    repository.findByGoogleId.mockResolvedValue(null);
    repository.findByEmail.mockResolvedValue(user);
    repository.findById.mockImplementation(async () => {
      const updated = repository.update.mock.calls[0]?.[0];
      return updated ?? user;
    });
    hasher.hash.mockResolvedValue("random-password-hash");

    const result = await useCase.execute({ idToken: "credential" });

    const merged = repository.update.mock.calls[0][0];
    expect(merged).toMatchObject({
      googleId: "google-123",
      passwordHash: "random-password-hash",
      emailVerified: true,
      emailVerificationTokenHash: undefined,
    });
    expect(result.mergedUnverifiedAccount).toBe(true);
  });

  it("creates a Google user when no account exists", async () => {
    const id = UserId.from(objectId());
    repository.findByGoogleId.mockResolvedValue(null);
    repository.findByEmail.mockResolvedValue(null);
    repository.create.mockResolvedValue(id);
    repository.findById.mockResolvedValue(
      reconstituteUser({ id, googleId: "google-123", emailVerified: true })
    );
    hasher.hash.mockResolvedValue("generated-hash");

    const result = await useCase.execute({ idToken: "credential" });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: null,
        email: "alice@example.com",
        googleId: "google-123",
        passwordHash: "generated-hash",
      })
    );
    expect(result.token).toBe("jwt");
  });
});
