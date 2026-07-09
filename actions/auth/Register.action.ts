import { IUserRepository } from "@/types/repositories/user.repository.types";
import bcrypt from "bcrypt";
import EmailService from "@/services/emailService";
import { generateTokenWithExpiry } from "@/utils/tokenHash";
import { ConflictError, ERROR_CODES } from "@/utils/errors";

export interface RegisterInput {
  email: string;
  password: string;
  acceptedCGU: boolean;
  emailNotifications?: boolean;
}

export interface IRegisterAction {
  execute(params: { registerData: RegisterInput }): Promise<{ _id: string }>;
}

class RegisterAction implements IRegisterAction {
  private emailService: EmailService;

  constructor(private userRepository: IUserRepository) {
    this.emailService = new EmailService();
  }

  async execute({
    registerData: { email, password, acceptedCGU, emailNotifications },
  }: {
    registerData: RegisterInput;
  }): Promise<{ _id: string }> {
    const { token, tokenHash, expiresAt } = generateTokenWithExpiry();

    const existingUser = await this.userRepository.findOne({ email });
    if (existingUser) {
      if (existingUser.emailVerified !== false) {
        throw new ConflictError(
          ERROR_CODES.AUTH_EMAIL_ALREADY_USED,
          "Cet email est déjà utilisé"
        );
      }
      await this.userRepository.updateOne(existingUser._id.toString(), {
        emailVerificationTokenHash: tokenHash,
        emailVerificationExpiresAt: expiresAt,
        preferences: {
          ...(existingUser.preferences ?? {}),
          emailNotifications: emailNotifications === true,
        },
      });
      await this.emailService.sendEmailVerification(email, token);
      return { _id: existingUser._id.toString() };
    }

    const hashed = await bcrypt.hash(password, 10);

    const userId = await this.userRepository.create({
      email,
      password: hashed,
      acceptedCGU,
      acceptedAt: new Date(),
      userType: "guest",
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: expiresAt,
      preferences: {
        emailNotifications: emailNotifications === true,
      },
    });

    await this.emailService.sendEmailVerification(email, token);

    return { _id: userId.toString() };
  }
}

export default RegisterAction;
