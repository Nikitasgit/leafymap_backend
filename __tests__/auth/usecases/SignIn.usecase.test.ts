import { Types } from "mongoose";
import SignInUseCase from "@src/application/usecases/auth/SignIn.usecase";
import { User } from "@src/domain/entities/User.entity";
import { IJwtTokenIssuer } from "@src/domain/interfaces/IJwtTokenIssuer";
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
  let useCase: SignInUseCase;

  beforeEach(() => {
    userRepository = createMockUserRepository();
    passwordHasher = {
      hash: jest.fn(),
      compare: jest.fn().mockResolvedValue(true),
    };
    jwtTokenIssuer = {
      issue: jest.fn().mockReturnValue("jwt-token"),
    };
    useCase = new SignInUseCase(
      userRepository,
      passwordHasher,
      jwtTokenIssuer
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
    expect(result.token).toBe("jwt-token");
    expect(userRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        lastLogin: expect.any(Date),
      })
    );
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
      statusCode: 401,
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
      statusCode: 401,
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
      statusCode: 403,
    });
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
      statusCode: 403,
    });
  });
});
