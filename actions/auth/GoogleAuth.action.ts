import { IUserRepository } from "@/types/repositories/user.repository.types";
import { generateToken } from "@/utils/jwt";
import { verifyGoogleIdToken } from "@/utils/googleAuth";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

export interface GoogleAuthInput {
  idToken: string;
}

export interface IGoogleAuthAction {
  execute(params: { googleAuthData: GoogleAuthInput }): Promise<{
    user: any;
    token: string;
    mergedUnverifiedAccount?: boolean;
  }>;
}

const USER_PROJECT = [
  "_id",
  "email",
  "username",
  "firstname",
  "lastname",
  "userType",
  "acceptedCGU",
  "googlePictureUrl",
] as const;

class GoogleAuthAction implements IGoogleAuthAction {
  constructor(private userRepository: IUserRepository) {}

  async execute({
    googleAuthData,
  }: {
    googleAuthData: GoogleAuthInput;
  }): Promise<{ user: any; token: string; mergedUnverifiedAccount?: boolean }> {
    const payload = await verifyGoogleIdToken(googleAuthData.idToken);
    const { email, sub: googleId, picture, given_name, family_name } = payload;

    const existingByGoogleId = await this.userRepository.findOne(
      { googleId },
      [...USER_PROJECT]
    );
    if (existingByGoogleId) {
      const token = generateToken({
        id: existingByGoogleId._id.toString(),
        userType: existingByGoogleId.userType,
      });
      return {
        user: existingByGoogleId,
        token,
      };
    }

    const existingByEmail = await this.userRepository.findOne(
      { email },
      [...USER_PROJECT, "emailVerified"]
    );
    if (existingByEmail) {
      const isUnverified = existingByEmail.emailVerified === false;
      if (isUnverified) {
        const randomPassword = randomBytes(32).toString("hex");
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        await this.userRepository.updateOne(existingByEmail._id.toString(), {
          password: hashedPassword,
          googleId,
          ...(picture && { googlePictureUrl: picture }),
          emailVerified: true,
          $unset: {
            emailVerificationTokenHash: 1,
            emailVerificationExpiresAt: 1,
          },
        });
      } else {
        await this.userRepository.updateOne(existingByEmail._id.toString(), {
          googleId,
          ...(picture && { googlePictureUrl: picture }),
        });
      }
      const userWithoutPassword = await this.userRepository.findById(
        existingByEmail._id.toString(),
        [...USER_PROJECT]
      );
      if (!userWithoutPassword) {
        throw new Error("User not found");
      }
      const token = generateToken({
        id: existingByEmail._id.toString(),
        userType: existingByEmail.userType,
      });
      return {
        user: userWithoutPassword,
        token,
        mergedUnverifiedAccount: isUnverified,
      };
    }

    const randomPassword = randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const userId = await this.userRepository.create({
      email,
      password: hashedPassword,
      firstname: given_name ?? undefined,
      lastname: family_name ?? undefined,
      userType: "guest",
      deleted: false,
      acceptedCGU: false,
      acceptedAt: new Date(0),
      googleId,
      ...(picture && { googlePictureUrl: picture }),
    });

    const userWithoutPassword = await this.userRepository.findById(
      userId.toString(),
      [...USER_PROJECT]
    );
    if (!userWithoutPassword) {
      throw new Error("User not found");
    }

    const token = generateToken({
      id: userId.toString(),
      userType: "guest",
    });

    return {
      user: userWithoutPassword,
      token,
    };
  }
}

export default GoogleAuthAction;
