import { Types } from "mongoose";
import VerifyEmailUseCase from "@src/application/usecases/auth/VerifyEmail.usecase";
import { User } from "@src/domain/entities/User.entity";
import { IOpaqueTokenFactory } from "@src/domain/interfaces/IOpaqueTokenFactory";
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
    userType: "guest",
    role: "user",
    deleted: false,
    followers: 0,
    interestIds: [],
    preferences: UserPreferences.from({}),
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

describe("VerifyEmailUseCase", () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let opaqueTokenFactory: jest.Mocked<IOpaqueTokenFactory>;
  let useCase: VerifyEmailUseCase;

  beforeEach(() => {
    userRepository = createMockUserRepository();
    opaqueTokenFactory = {
      generate: jest.fn(),
      hash: jest.fn().mockReturnValue("hashed-token"),
      isExpired: jest.fn().mockReturnValue(false),
    };
    useCase = new VerifyEmailUseCase(userRepository, opaqueTokenFactory);
  });

  it("verifies the user email with a valid token", async () => {
    const user = buildUser({
      emailVerificationTokenHash: "hashed-token",
      emailVerificationExpiresAt: new Date(Date.now() + 60_000),
    });
    userRepository.findByEmailVerificationTokenHash.mockResolvedValue(user);

    await useCase.execute({ token: "valid-verification-token" });

    expect(opaqueTokenFactory.hash).toHaveBeenCalledWith(
      "valid-verification-token"
    );
    expect(userRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        emailVerified: true,
        emailVerificationTokenHash: undefined,
        emailVerificationExpiresAt: undefined,
      })
    );
  });

  it("rejects when no user matches the token", async () => {
    userRepository.findByEmailVerificationTokenHash.mockResolvedValue(null);

    await expect(
      useCase.execute({ token: "unknown-token" })
    ).rejects.toMatchObject({
      code: ERROR_CODES.AUTH_INVALID_EMAIL_VERIFICATION_TOKEN,
      statusCode: 401,
    });

    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it("rejects when the verification token is expired", async () => {
    const user = buildUser({
      emailVerificationTokenHash: "hashed-token",
      emailVerificationExpiresAt: new Date(Date.now() - 60_000),
    });
    userRepository.findByEmailVerificationTokenHash.mockResolvedValue(user);
    opaqueTokenFactory.isExpired.mockReturnValue(true);

    await expect(
      useCase.execute({ token: "expired-verification-token" })
    ).rejects.toMatchObject({
      code: ERROR_CODES.AUTH_INVALID_EMAIL_VERIFICATION_TOKEN,
      statusCode: 401,
    });

    expect(userRepository.update).not.toHaveBeenCalled();
  });
});
