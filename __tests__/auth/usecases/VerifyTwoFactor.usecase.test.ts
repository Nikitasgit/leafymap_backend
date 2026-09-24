import { Types } from "mongoose";
import VerifyTwoFactorUseCase from "@src/application/usecases/auth/VerifyTwoFactor.usecase";
import { User } from "@src/domain/entities/User.entity";
import { IJwtTokenIssuer } from "@src/domain/interfaces/IJwtTokenIssuer";
import { IOpaqueTokenFactory } from "@src/domain/interfaces/IOpaqueTokenFactory";
import { ITwoFactorService } from "@src/domain/interfaces/ITwoFactorService";
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
    totpEnabled: true,
    totpSecret: "totp-secret",
    recoveryCodeHashes: ["recovery-hash"],
    twoFactorChallengeHash: "challenge-hash",
    twoFactorChallengeExpiresAt: new Date(Date.now() + 60_000),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

describe("VerifyTwoFactorUseCase", () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let twoFactorService: jest.Mocked<ITwoFactorService>;
  let opaqueTokenFactory: jest.Mocked<IOpaqueTokenFactory>;
  let jwtTokenIssuer: jest.Mocked<IJwtTokenIssuer>;
  let useCase: VerifyTwoFactorUseCase;

  beforeEach(() => {
    userRepository = createMockUserRepository();
    twoFactorService = {
      generateSecret: jest.fn(),
      generateOtpauthUri: jest.fn(),
      generateQrDataUrl: jest.fn(),
      verifyTotp: jest.fn().mockReturnValue(false),
      generateRecoveryCodes: jest.fn(),
      hashRecoveryCode: jest.fn().mockReturnValue("other-hash"),
    };
    opaqueTokenFactory = {
      generate: jest.fn(),
      hash: jest.fn().mockReturnValue("challenge-hash"),
      isExpired: jest.fn().mockReturnValue(false),
    };
    jwtTokenIssuer = {
      issue: jest.fn().mockReturnValue("jwt-token"),
      verify: jest.fn(),
    };
    useCase = new VerifyTwoFactorUseCase(
      userRepository,
      twoFactorService,
      opaqueTokenFactory,
      jwtTokenIssuer
    );
  });

  it("issues a session token when the TOTP code is valid", async () => {
    const acceptedAt = new Date("2026-01-01T00:00:00.000Z");
    const user = buildUser({ acceptedAt });
    userRepository.findByTwoFactorChallengeHash.mockResolvedValue(user);
    twoFactorService.verifyTotp.mockReturnValue(true);

    const result = await useCase.execute({
      challengeToken: "challenge-token",
      code: "123456",
    });

    expect(result.token).toBe("jwt-token");
    expect(result.user.email).toBe("user@example.com");
    expect(result.user.acceptedAt).toEqual(acceptedAt);
    expect(userRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        lastLogin: expect.any(Date),
        twoFactorChallengeHash: undefined,
        recoveryCodeHashes: ["recovery-hash"],
      })
    );
  });

  it("rejects an invalid code", async () => {
    userRepository.findByTwoFactorChallengeHash.mockResolvedValue(buildUser());

    await expect(
      useCase.execute({
        challengeToken: "challenge-token",
        code: "000000",
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.AUTH_TWO_FACTOR_INVALID_CODE,
    });

    expect(jwtTokenIssuer.issue).not.toHaveBeenCalled();
  });

  it("consumes a recovery code only once", async () => {
    const user = buildUser();
    userRepository.findByTwoFactorChallengeHash.mockResolvedValue(user);
    twoFactorService.hashRecoveryCode.mockReturnValue("recovery-hash");

    const result = await useCase.execute({
      challengeToken: "challenge-token",
      code: "AAAAA-BBBBB",
    });

    expect(result.token).toBe("jwt-token");
    expect(userRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        recoveryCodeHashes: [],
      })
    );

    const consumed = user.consumeRecoveryCode("recovery-hash");
    expect(consumed.recoveryCodeHashes).toEqual([]);
    expect(consumed.recoveryCodeHashes.includes("recovery-hash")).toBe(false);
  });
});
