import { Types } from "mongoose";
import ResetPasswordUseCase from "@src/application/usecases/auth/ResetPassword.usecase";
import { User } from "@src/domain/entities/User.entity";
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
    userType: "guest",
    role: "user",
    deleted: false,
    followers: 0,
    interestIds: [],
    preferences: UserPreferences.from({}),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

describe("ResetPasswordUseCase", () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let opaqueTokenFactory: jest.Mocked<IOpaqueTokenFactory>;
  let passwordHasher: jest.Mocked<IPasswordHasher>;
  let useCase: ResetPasswordUseCase;

  beforeEach(() => {
    userRepository = createMockUserRepository();
    opaqueTokenFactory = {
      generate: jest.fn(),
      hash: jest.fn().mockReturnValue("hashed-token"),
      isExpired: jest.fn().mockReturnValue(false),
    };
    passwordHasher = {
      hash: jest.fn().mockResolvedValue("hashed-new-password"),
      compare: jest.fn(),
    };
    useCase = new ResetPasswordUseCase(
      userRepository,
      opaqueTokenFactory,
      passwordHasher
    );
  });

  it("resets the password with a valid token", async () => {
    const user = buildUser({
      resetPasswordTokenHash: "hashed-token",
      resetPasswordExpiresAt: new Date(Date.now() + 60_000),
    });
    userRepository.findByResetPasswordTokenHash.mockResolvedValue(user);

    await useCase.execute({
      token: "valid-reset-token",
      newPassword: "NewPassword1",
    });

    expect(passwordHasher.hash).toHaveBeenCalledWith("NewPassword1");
    expect(userRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        passwordHash: "hashed-new-password",
        resetPasswordTokenHash: undefined,
        resetPasswordExpiresAt: undefined,
      })
    );
  });

  it("rejects when no user matches the reset token", async () => {
    userRepository.findByResetPasswordTokenHash.mockResolvedValue(null);

    await expect(
      useCase.execute({
        token: "unknown-token",
        newPassword: "NewPassword1",
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.AUTH_INVALID_RESET_PASSWORD_TOKEN,
      statusCode: 401,
    });

    expect(userRepository.update).not.toHaveBeenCalled();
    expect(passwordHasher.hash).not.toHaveBeenCalled();
  });

  it("rejects when the reset token is expired", async () => {
    const user = buildUser({
      resetPasswordTokenHash: "hashed-token",
      resetPasswordExpiresAt: new Date(Date.now() - 60_000),
    });
    userRepository.findByResetPasswordTokenHash.mockResolvedValue(user);
    opaqueTokenFactory.isExpired.mockReturnValue(true);

    await expect(
      useCase.execute({
        token: "expired-reset-token",
        newPassword: "NewPassword1",
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.AUTH_INVALID_RESET_PASSWORD_TOKEN,
      statusCode: 401,
    });

    expect(userRepository.update).not.toHaveBeenCalled();
    expect(passwordHasher.hash).not.toHaveBeenCalled();
  });
});
