import { IUser } from "@/types/models/user";
import { IUserRepository } from "@/types/repositories/user.repository.types";
import { getBanMessage, isBanActive } from "@/utils/ban";
import { verifyGoogleIdToken } from "@/utils/googleAuth";
import { generateToken } from "@/utils/jwt";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

export interface GoogleAuthInput {
  idToken: string;
}

type GoogleAuthUser = Pick<
  IUser,
  | "_id"
  | "email"
  | "username"
  | "firstname"
  | "lastname"
  | "userType"
  | "role"
  | "acceptedCGU"
  | "googlePictureUrl"
  | "deleted"
  | "bannedAt"
  | "banReason"
  | "banExpiresAt"
>;

export interface IGoogleAuthAction {
  execute(params: { googleAuthData: GoogleAuthInput }): Promise<{
    user: GoogleAuthUser;
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
  "role",
  "acceptedCGU",
  "googlePictureUrl",
  "deleted",
  "bannedAt",
  "banReason",
  "banExpiresAt",
] as const;

class GoogleAuthAction implements IGoogleAuthAction {
  constructor(private userRepository: IUserRepository) {}

  private async buildAuthResponse(
    userId: string,
    userType: IUser["userType"],
    mergedUnverifiedAccount?: boolean
  ): Promise<{
    user: GoogleAuthUser;
    token: string;
    mergedUnverifiedAccount?: boolean;
  }>;

  private async buildAuthResponse(
    user: GoogleAuthUser
  ): Promise<{ user: GoogleAuthUser; token: string }>;

  private async buildAuthResponse(
    userOrId: string | GoogleAuthUser,
    userType?: IUser["userType"],
    mergedUnverifiedAccount?: boolean
  ): Promise<{
    user: GoogleAuthUser;
    token: string;
    mergedUnverifiedAccount?: boolean;
  }> {
    if (typeof userOrId === "string") {
      const user = await this.userRepository.findById(userOrId, [
        ...USER_PROJECT,
      ]);
      if (!user) {
        throw new Error("User not found");
      }
      if (user.deleted) {
        throw new Error("Ce compte n'est plus accessible");
      }
      if (isBanActive(user)) {
        throw new Error(getBanMessage(user));
      }
      await this.userRepository.updateOne(user._id.toString(), {
        lastLogin: new Date(),
      });
      const token = generateToken({
        id: userOrId,
        userType: userType!,
        role: user.role,
      });
      return {
        user,
        token,
        ...(mergedUnverifiedAccount !== undefined && {
          mergedUnverifiedAccount,
        }),
      };
    }
    const user = userOrId;
    if (user.deleted) {
      throw new Error("Ce compte n'est plus accessible");
    }
    if (isBanActive(user)) {
      throw new Error(getBanMessage(user));
    }
    await this.userRepository.updateOne(user._id.toString(), {
      lastLogin: new Date(),
    });
    const token = generateToken({
      id: user._id.toString(),
      userType: user.userType,
      role: user.role,
    });
    return { user, token };
  }

  async execute({
    googleAuthData,
  }: {
    googleAuthData: GoogleAuthInput;
  }): Promise<{
    user: GoogleAuthUser;
    token: string;
    mergedUnverifiedAccount?: boolean;
  }> {
    const payload = await verifyGoogleIdToken(googleAuthData.idToken);
    const { email, sub: googleId, picture, given_name, family_name } = payload;

    const existingByGoogleId = await this.userRepository.findOne(
      { googleId },
      [...USER_PROJECT]
    );
    if (existingByGoogleId) {
      return this.buildAuthResponse(
        existingByGoogleId._id.toString(),
        existingByGoogleId.userType
      );
    }

    const existingByEmail = await this.userRepository.findOne(
      { email },
      [...USER_PROJECT, "emailVerified"]
    );
    if (existingByEmail) {
      const isUnverified = existingByEmail.emailVerified === false;
      const updatePayload: Record<string, unknown> = {
        googleId,
        ...(picture && { googlePictureUrl: picture }),
      };
      if (isUnverified) {
        const hashedPassword = await bcrypt.hash(
          randomBytes(32).toString("hex"),
          10
        );
        Object.assign(updatePayload, {
          password: hashedPassword,
          emailVerified: true,
          $unset: {
            emailVerificationTokenHash: 1,
            emailVerificationExpiresAt: 1,
          },
        });
      }
      await this.userRepository.updateOne(
        existingByEmail._id.toString(),
        updatePayload
      );
      return this.buildAuthResponse(
        existingByEmail._id.toString(),
        existingByEmail.userType,
        isUnverified
      );
    }

    const hashedPassword = await bcrypt.hash(
      randomBytes(32).toString("hex"),
      10
    );
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
      preferences: {
        emailNotifications: false,
      },
      ...(picture && { googlePictureUrl: picture }),
    });

    return this.buildAuthResponse(userId.toString(), "guest");
  }
}

export default GoogleAuthAction;
