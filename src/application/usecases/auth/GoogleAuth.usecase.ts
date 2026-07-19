import { randomBytes } from "crypto";
import {
  GoogleAuthInput,
  GoogleAuthOutput,
  GoogleAuthUserOutput,
} from "@src/application/dtos/auth/googleAuth.dto";
import { User } from "@src/domain/entities/User.entity";
import { IGoogleIdentityVerifier } from "@src/domain/interfaces/IGoogleIdentityVerifier";
import { IJwtTokenIssuer } from "@src/domain/interfaces/IJwtTokenIssuer";
import { IPasswordHasher } from "@src/domain/interfaces/IPasswordHasher";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES, NotFoundError } from "@src/shared/errors";

class GoogleAuthUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly googleIdentityVerifier: IGoogleIdentityVerifier,
    private readonly passwordHasher: IPasswordHasher,
    private readonly jwtTokenIssuer: IJwtTokenIssuer
  ) {}

  private toAuthUser(user: User): GoogleAuthUserOutput {
    return {
      _id: user.id!,
      email: user.email,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      userType: user.userType,
      role: user.role,
      acceptedCGU: user.acceptedCGU,
      googlePictureUrl: user.googlePictureUrl,
      deleted: user.deleted,
      bannedAt: user.bannedAt,
      banReason: user.banReason,
      banExpiresAt: user.banExpiresAt,
    };
  }

  private async buildAuthResponse(
    userId: UserId,
    mergedUnverifiedAccount?: boolean
  ): Promise<GoogleAuthOutput> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(ERROR_CODES.USER_NOT_FOUND, "User not found");
    }

    user.assertCanAuthenticate();

    const loggedIn = user.recordLogin();
    await this.userRepository.update(loggedIn);

    const token = this.jwtTokenIssuer.issue({
      id: userId,
      userType: user.userType,
      role: user.role,
    });

    return {
      user: this.toAuthUser(user),
      token,
      ...(mergedUnverifiedAccount !== undefined && { mergedUnverifiedAccount }),
    };
  }

  async execute(params: GoogleAuthInput): Promise<GoogleAuthOutput> {
    const identity = await this.googleIdentityVerifier.verifyIdToken(
      params.idToken
    );
    const {
      email,
      googleId,
      picture,
      givenName,
      familyName,
    } = identity;

    const existingByGoogleId =
      await this.userRepository.findByGoogleId(googleId);
    if (existingByGoogleId?.id) {
      return this.buildAuthResponse(existingByGoogleId.id);
    }

    const existingByEmail = await this.userRepository.findByEmail(email);
    if (existingByEmail?.id) {
      const isUnverified = existingByEmail.emailVerified === false;
      let updated: User;

      if (isUnverified) {
        const passwordHash = await this.passwordHasher.hash(
          randomBytes(32).toString("hex")
        );
        updated = existingByEmail.mergeUnverifiedWithGoogle({
          googleId,
          passwordHash,
          googlePictureUrl: picture,
        });
      } else {
        updated = existingByEmail.linkGoogleAccount({
          googleId,
          googlePictureUrl: picture,
        });
      }

      await this.userRepository.update(updated);
      return this.buildAuthResponse(existingByEmail.id, isUnverified);
    }

    const passwordHash = await this.passwordHasher.hash(
      randomBytes(32).toString("hex")
    );
    const user = User.registerFromGoogle({
      email,
      passwordHash,
      googleId,
      firstname: givenName,
      lastname: familyName,
      googlePictureUrl: picture,
    });

    const userId = await this.userRepository.create(user);
    return this.buildAuthResponse(userId);
  }
}

export default GoogleAuthUseCase;
