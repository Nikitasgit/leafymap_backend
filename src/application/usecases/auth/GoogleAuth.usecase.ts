import { randomBytes } from "crypto";
import {
  GoogleAuthInput,
  GoogleAuthOutput,
  GoogleAuthUserOutput,
} from "@src/application/dtos/auth/googleAuth.dto";
import { User } from "@src/domain/entities/User.entity";
import { IGoogleIdentityVerifier } from "@src/domain/interfaces/IGoogleIdentityVerifier";
import { IJwtTokenIssuer } from "@src/domain/interfaces/IJwtTokenIssuer";
import { IOpaqueTokenFactory } from "@src/domain/interfaces/IOpaqueTokenFactory";
import { IPasswordHasher } from "@src/domain/interfaces/IPasswordHasher";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES, NotFoundError } from "@src/shared/errors";

const TWO_FACTOR_CHALLENGE_MINUTES = 5;

class GoogleAuthUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly googleIdentityVerifier: IGoogleIdentityVerifier,
    private readonly passwordHasher: IPasswordHasher,
    private readonly jwtTokenIssuer: IJwtTokenIssuer,
    private readonly opaqueTokenFactory: IOpaqueTokenFactory
  ) {}

  private toAuthUser(user: User): GoogleAuthUserOutput {
    return {
      id: user.id!,
      email: user.email,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      userType: user.userType,
      role: user.role,
      acceptedAt: user.acceptedAt,
      googlePictureUrl: user.googlePictureUrl,
      deleted: user.deleted,
      bannedAt: user.bannedAt,
      banReason: user.banReason,
      banExpiresAt: user.banExpiresAt,
      twoFactorEnabled: user.totpEnabled,
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

    if (user.totpEnabled) {
      const challenge = this.opaqueTokenFactory.generate(
        TWO_FACTOR_CHALLENGE_MINUTES
      );
      await this.userRepository.update(
        user.setTwoFactorChallenge(challenge.tokenHash, challenge.expiresAt)
      );
      return {
        twoFactorRequired: true,
        challengeToken: challenge.token,
        ...(mergedUnverifiedAccount !== undefined && {
          mergedUnverifiedAccount,
        }),
      };
    }

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
