import { Types } from "mongoose";
import SignInUseCase from "@src/application/usecases/auth/SignIn.usecase";
import { User } from "@src/domain/entities/User.entity";
import { IJwtTokenIssuer } from "@src/domain/interfaces/IJwtTokenIssuer";
import { IOpaqueTokenFactory } from "@src/domain/interfaces/IOpaqueTokenFactory";
import { IPasswordHasher } from "@src/domain/interfaces/IPasswordHasher";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { UserPreferences } from "@src/domain/value-objects/UserPreferences.vo";
import { ERROR_CODES } from "@src/shared/errors";
import { createMockUserRepository } from "../../helpers/mockUserRepository";

const mockObjectId = (): string => new Types.ObjectId().toString();

const buildUser = (
  overrides: Partial<Parameters<typeof User.reconstitute>[0]> = {}
) =>
  User.reconstitute({
    id: UserId.from(mockObjectId()),
    email: "user@example.com",
    username: "user",
    userType: "guest",
    role: "user",
    deleted: false,
    followers: 0,
    interestIds: [],
    preferences: UserPreferences.from({}),
    passwordHash: "hashed-password",
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

describe("SignInUseCase", () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasher>;
  let jwtTokenIssuer: jest.Mocked<IJwtTokenIssuer>;
  let opaqueTokenFactory: jest.Mocked<IOpaqueTokenFactory>;
  let useCase: SignInUseCase;

  beforeEach(() => {
    userRepository = createMockUserRepository();
    passwordHasher = {
      hash: jest.fn(),
      compare: jest.fn().mockResolvedValue(true),
    };
    jwtTokenIssuer = {
      issue: jest.fn().mockReturnValue("jwt-token"),
      verify: jest.fn(),
    };
    opaqueTokenFactory = {
      generate: jest.fn().mockReturnValue({
        token: "challenge-token",
        tokenHash: "challenge-hash",
        expiresAt: new Date(Date.now() + 5 * 60_000),
      }),
      hash: jest.fn(),
      isExpired: jest.fn(),
    };
    useCase = new SignInUseCase(
      userRepository,
      passwordHasher,
      jwtTokenIssuer,
      opaqueTokenFactory
    );
  });

  it("returns user and token on successful sign in and updates lastLogin", async () => {
    const user = buildUser({
      email: "admin@test.com",
      username: "admin",
      role: "admin",
    });
    userRepository.findByEmailOrUsername.mockResolvedValue(user);

    const result = await useCase.execute({
      identifier: "admin@test.com",
      password: "password",
    });

    expect(result.user.role).toBe("admin");
    expect(result.user.acceptedAt).toBeUndefined();
    expect(result.token).toBe("jwt-token");
    expect(userRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        lastLogin: expect.any(Date),
      })
    );
  });

  it("returns the CGU acceptance date saved at registration", async () => {
    const acceptedAt = new Date("2026-01-01T00:00:00.000Z");
    userRepository.findByEmailOrUsername.mockResolvedValue(
      buildUser({ acceptedAt })
    );

    const result = await useCase.execute({
      identifier: "user@example.com",
      password: "password",
    });

    expect(result.user?.acceptedAt).toEqual(acceptedAt);
  });

  it("rejects invalid credentials when user is not found", async () => {
    userRepository.findByEmailOrUsername.mockResolvedValue(null);

    await expect(
      useCase.execute({
        identifier: "unknown@test.com",
        password: "password",
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
    });

    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it("rejects invalid credentials when password is wrong", async () => {
    userRepository.findByEmailOrUsername.mockResolvedValue(buildUser());
    passwordHasher.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({
        identifier: "user@test.com",
        password: "wrong-password",
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
    });
  });

  it("rejects sign in when email is not verified", async () => {
    userRepository.findByEmailOrUsername.mockResolvedValue(
      buildUser({ emailVerified: false })
    );

    await expect(
      useCase.execute({
        identifier: "user@test.com",
        password: "password",
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.AUTH_EMAIL_NOT_VERIFIED,
    });
  });

  it("returns a challenge and no session token when two-factor is enabled", async () => {
    userRepository.findByEmailOrUsername.mockResolvedValue(
      buildUser({
        totpEnabled: true,
        totpSecret: "secret",
      })
    );

    const result = await useCase.execute({
      identifier: "user@test.com",
      password: "password",
    });

    expect(result).toEqual({
      twoFactorRequired: true,
      challengeToken: "challenge-token",
    });
    expect(jwtTokenIssuer.issue).not.toHaveBeenCalled();
    expect(userRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        twoFactorChallengeHash: "challenge-hash",
        lastLogin: undefined,
      })
    );
  });

  it("rejects sign in for an active ban", async () => {
    userRepository.findByEmailOrUsername.mockResolvedValue(
      buildUser({
        bannedAt: new Date(),
        banReason: "Spam",
        banExpiresAt: new Date(Date.now() + 60_000),
      })
    );

    await expect(
      useCase.execute({
        identifier: "user@test.com",
        password: "password",
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.AUTH_USER_BANNED,
    });
  });
});
