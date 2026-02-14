import { IUserRepository } from "@/types/repositories/user.repository.types";
import bcrypt from "bcrypt";

export interface ResetPasswordInput {
  userId: string;
  token: string;
  newPassword: string;
}

export interface IResetPasswordAction {
  execute(params: {
    resetData: ResetPasswordInput;
  }): Promise<void>;
}

class ResetPasswordAction implements IResetPasswordAction {
  constructor(private userRepository: IUserRepository) {}

  async execute({
    resetData,
  }: {
    resetData: ResetPasswordInput;
  }): Promise<void> {
    const { userId, token, newPassword } = resetData;

    const user = await this.userRepository.findById(userId);

    if (!user || !user.resetPasswordToken) {
      throw new Error(
        "Le lien de réinitialisation est invalide ou a expiré. Veuillez faire une nouvelle demande."
      );
    }

    const colonIndex = user.resetPasswordToken.indexOf(":");
    const expiryStr = user.resetPasswordToken.slice(0, colonIndex);
    const hashedToken = user.resetPasswordToken.slice(colonIndex + 1);
    const expiryMs = parseInt(expiryStr, 10);
    if (Number.isNaN(expiryMs) || Date.now() > expiryMs) {
      throw new Error(
        "Le lien de réinitialisation est invalide ou a expiré. Veuillez faire une nouvelle demande."
      );
    }

    const tokenMatches = await bcrypt.compare(token, hashedToken);
    if (!tokenMatches) {
      throw new Error(
        "Le lien de réinitialisation est invalide ou a expiré. Veuillez faire une nouvelle demande."
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userRepository.updateOne(user._id.toString(), {
      $set: { password: hashedPassword },
      $unset: { resetPasswordToken: 1 },
    });
  }
}

export default ResetPasswordAction;
