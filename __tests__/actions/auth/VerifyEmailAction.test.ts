import VerifyEmailAction from "@/actions/auth/VerifyEmail.action";
import { IUserRepository } from "@/types/repositories/user.repository.types";
import { ERROR_CODES } from "@/utils/errors";
import { hashToken } from "@/utils/tokenHash";
import { buildUser, createMockRepository } from "../../helpers/mockRepositories";

describe("VerifyEmailAction", () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let action: VerifyEmailAction;

  beforeEach(() => {
    userRepository = createMockRepository<IUserRepository>();
    action = new VerifyEmailAction(userRepository);
  });

  it("verifies the user email with a valid token", async () => {
    const rawToken = "valid-verification-token";
    const user = buildUser({
      emailVerified: false,
      emailVerificationTokenHash: hashToken(rawToken),
      emailVerificationExpiresAt: new Date(Date.now() + 60_000),
    });

    userRepository.findOne.mockResolvedValue(user as never);

    await action.execute({ verifyData: { token: rawToken } });

    expect(userRepository.updateOne).toHaveBeenCalledWith(
      user._id!.toString(),
      {
        emailVerified: true,
        $unset: {
          emailVerificationTokenHash: 1,
          emailVerificationExpiresAt: 1,
        },
      }
    );
  });

  it("rejects when no user matches the token", async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(
      action.execute({ verifyData: { token: "unknown-token" } })
    ).rejects.toMatchObject({
      code: ERROR_CODES.AUTH_INVALID_EMAIL_VERIFICATION_TOKEN,
      statusCode: 401,
    });

    expect(userRepository.updateOne).not.toHaveBeenCalled();
  });

  it("rejects when the verification token is expired", async () => {
    const rawToken = "expired-verification-token";
    const user = buildUser({
      emailVerificationTokenHash: hashToken(rawToken),
      emailVerificationExpiresAt: new Date(Date.now() - 60_000),
    });

    userRepository.findOne.mockResolvedValue(user as never);

    await expect(
      action.execute({ verifyData: { token: rawToken } })
    ).rejects.toMatchObject({
      code: ERROR_CODES.AUTH_INVALID_EMAIL_VERIFICATION_TOKEN,
      statusCode: 401,
    });

    expect(userRepository.updateOne).not.toHaveBeenCalled();
  });
});
