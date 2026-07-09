import { IUserRepository } from "@/types/repositories/user.repository.types";
import bcrypt from "bcrypt";
import { hashToken, isTokenExpired } from "@/utils/tokenHash";
import { ERROR_CODES, UnauthorizedError } from "@/utils/errors";

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface IResetPasswordAction {
  execute(params: {
    resetData: ResetPasswordInput;
  }): Promise<void>;
}

const INVALID_TOKEN_MESSAGE =
  "Le lien de réinitialisation est invalide ou a expiré. Veuillez faire une nouvelle demande.";

class ResetPasswordAction implements IResetPasswordAction {
  constructor(private userRepository: IUserRepository) {}

  async execute({
    resetData,
  }: {
    resetData: ResetPasswordInput;
  }): Promise<void> {
    const { token, newPassword } = resetData;
    const hashed = hashToken(token);

    const user = await this.userRepository.findOne({
      resetPasswordTokenHash: hashed,
    });

    if (!user || isTokenExpired(user.resetPasswordExpiresAt)) {
      throw new UnauthorizedError(
        ERROR_CODES.AUTH_INVALID_RESET_PASSWORD_TOKEN,
        INVALID_TOKEN_MESSAGE
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userRepository.updateOne(user._id.toString(), {
      password: hashedPassword,
      $unset: { resetPasswordTokenHash: 1, resetPasswordExpiresAt: 1 },
    });
  }
}

export default ResetPasswordAction;
