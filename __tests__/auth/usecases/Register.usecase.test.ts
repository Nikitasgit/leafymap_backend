import { Types } from "mongoose";
import RegisterUseCase from "@src/application/usecases/auth/Register.usecase";
import { User } from "@src/domain/entities/User.entity";
import { IAuthEmailSender } from "@src/domain/interfaces/IAuthEmailSender";
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
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

describe("RegisterUseCase", () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasher>;
  let opaqueTokenFactory: jest.Mocked<IOpaqueTokenFactory>;
  let authEmailSender: jest.Mocked<IAuthEmailSender>;
  let useCase: RegisterUseCase;

  beforeEach(() => {
    userRepository = createMockUserRepository();
    passwordHasher = {
      hash: jest.fn().mockResolvedValue("hashed-password"),
      compare: jest.fn(),
    };
    opaqueTokenFactory = {
      generate: jest.fn().mockReturnValue({
        token: "raw-token",
        tokenHash: "token-hash",
        expiresAt: new Date(Date.now() + 60_000),
      }),
      hash: jest.fn(),
      isExpired: jest.fn(),
    };
    authEmailSender = {
      sendEmailVerification: jest.fn().mockResolvedValue(undefined),
      sendPasswordResetEmail: jest.fn(),
    };
    useCase = new RegisterUseCase(
      userRepository,
      passwordHasher,
      opaqueTokenFactory,
      authEmailSender
    );
  });

  it("creates a new user and sends a verification email", async () => {
    const userId = UserId.from(mockObjectId());
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue(userId);

    const result = await useCase.execute({
      email: "new@test.com",
      password: "Password1",
      acceptedCGU: true,
      emailNotifications: true,
    });

    expect(result).toEqual({ id: userId });
    expect(passwordHasher.hash).toHaveBeenCalledWith("Password1");
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "new@test.com",
        acceptedCGU: true,
        emailVerified: false,
      })
    );
    expect(authEmailSender.sendEmailVerification).toHaveBeenCalledWith(
      "new@test.com",
      "raw-token"
    );
  });

  it("rejects registration when email is already used and verified", async () => {
    userRepository.findByEmail.mockResolvedValue(
      buildUser({ emailVerified: true })
    );

    await expect(
      useCase.execute({
        email: "existing@test.com",
        password: "Password1",
        acceptedCGU: true,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.AUTH_EMAIL_ALREADY_USED,
    });

    expect(userRepository.create).not.toHaveBeenCalled();
    expect(authEmailSender.sendEmailVerification).not.toHaveBeenCalled();
  });

  it("resends verification for an existing unverified user without creating a new one", async () => {
    const existingUser = buildUser({
      email: "unverified@test.com",
      emailVerified: false,
      preferences: UserPreferences.from({ emailNotifications: false }),
    });
    userRepository.findByEmail.mockResolvedValue(existingUser);

    const result = await useCase.execute({
      email: "unverified@test.com",
      password: "Password1",
      acceptedCGU: true,
      emailNotifications: true,
    });

    expect(result).toEqual({ id: existingUser.id });
    expect(userRepository.create).not.toHaveBeenCalled();
    expect(userRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        emailVerificationTokenHash: "token-hash",
        preferences: expect.objectContaining({ emailNotifications: true }),
      })
    );
    expect(authEmailSender.sendEmailVerification).toHaveBeenCalledWith(
      "unverified@test.com",
      "raw-token"
    );
  });
});
