import bcrypt from "bcrypt";
import ResetPasswordAction from "@/actions/auth/ResetPassword.action";
import { IUserRepository } from "@/types/repositories/user.repository.types";
import { ERROR_CODES } from "@/utils/errors";
import { hashToken } from "@/utils/tokenHash";
import { buildUser, createMockRepository } from "../../helpers/mockRepositories";

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed-new-password"),
}));

describe("ResetPasswordAction", () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let action: ResetPasswordAction;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = createMockRepository<IUserRepository>();
    action = new ResetPasswordAction(userRepository);
  });

  it("resets the password with a valid token", async () => {
    const rawToken = "valid-reset-token";
    const user = buildUser({
      resetPasswordTokenHash: hashToken(rawToken),
      resetPasswordExpiresAt: new Date(Date.now() + 60_000),
    });

    userRepository.findOne.mockResolvedValue(user as never);

    await action.execute({
      resetData: { token: rawToken, newPassword: "NewPassword1" },
    });

    expect(bcrypt.hash).toHaveBeenCalledWith("NewPassword1", 10);
    expect(userRepository.updateOne).toHaveBeenCalledWith(
      user._id!.toString(),
      {
        password: "hashed-new-password",
        $unset: { resetPasswordTokenHash: 1, resetPasswordExpiresAt: 1 },
      }
    );
  });

  it("rejects when no user matches the reset token", async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(
      action.execute({
        resetData: { token: "unknown-token", newPassword: "NewPassword1" },
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.AUTH_INVALID_RESET_PASSWORD_TOKEN,
      statusCode: 401,
    });

    expect(userRepository.updateOne).not.toHaveBeenCalled();
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });

  it("rejects when the reset token is expired", async () => {
    const rawToken = "expired-reset-token";
    const user = buildUser({
      resetPasswordTokenHash: hashToken(rawToken),
      resetPasswordExpiresAt: new Date(Date.now() - 60_000),
    });

    userRepository.findOne.mockResolvedValue(user as never);

    await expect(
      action.execute({
        resetData: { token: rawToken, newPassword: "NewPassword1" },
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.AUTH_INVALID_RESET_PASSWORD_TOKEN,
      statusCode: 401,
    });

    expect(userRepository.updateOne).not.toHaveBeenCalled();
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });
});
