import {
  ImageId,
  PlaceId,
  UserCategoryId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { UserAddress } from "@src/domain/value-objects/UserAddress.vo";
import { UserPreferences } from "@src/domain/value-objects/UserPreferences.vo";
import { ERROR_CODES, ForbiddenError } from "@src/shared/errors";

export type UserType = "creator" | "guest";
export type UserRole = "user" | "admin";

export interface RegisterUserParams {
  email: string;
  passwordHash: string;
  acceptedCGU: boolean;
  emailNotifications?: boolean;
  emailVerificationTokenHash: string;
  emailVerificationExpiresAt: Date;
}

export interface RegisterFromGoogleParams {
  email: string;
  passwordHash: string;
  googleId: string;
  firstname?: string;
  lastname?: string;
  googlePictureUrl?: string;
}

export interface ReconstituteUserParams {
  id: UserId;
  firstname?: string;
  lastname?: string;
  username?: string;
  userCategoryId?: UserCategoryId;
  email: string;
  website?: string;
  phone?: string;
  passwordHash?: string;
  userType: UserType;
  role: UserRole;
  deleted: boolean;
  bannedAt?: Date;
  banReason?: string;
  banDuration?: number;
  banExpiresAt?: Date;
  lastLogin?: Date;
  address?: UserAddress;
  description?: string;
  country?: string;
  imageId?: ImageId;
  followers: number;
  interestIds: UserCategoryId[];
  placeId?: PlaceId;
  acceptedCGU?: boolean;
  acceptedAt?: Date;
  emailVerified?: boolean;
  emailVerificationTokenHash?: string;
  emailVerificationExpiresAt?: Date;
  resetPasswordTokenHash?: string;
  resetPasswordExpiresAt?: Date;
  googleId?: string;
  googlePictureUrl?: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserProfileParams {
  firstname?: string;
  lastname?: string;
  username?: string;
  userCategoryId?: UserCategoryId;
  website?: string;
  phone?: string;
  userType?: UserType;
  address?: UserAddress;
  description?: string;
  country?: string;
  imageId?: ImageId;
  interestIds?: UserCategoryId[];
  googlePictureUrl?: string;
  preferences?: UserPreferences;
}

export interface AssertCanAuthenticateOptions {
  requireEmailVerified?: boolean;
}

type UserProps = {
  id: UserId | null;
  firstname: string | undefined;
  lastname: string | undefined;
  username: string | undefined;
  userCategoryId: UserCategoryId | undefined;
  email: string;
  website: string | undefined;
  phone: string | undefined;
  passwordHash: string | undefined;
  userType: UserType;
  role: UserRole;
  deleted: boolean;
  bannedAt: Date | undefined;
  banReason: string | undefined;
  banDuration: number | undefined;
  banExpiresAt: Date | undefined;
  lastLogin: Date | undefined;
  address: UserAddress | undefined;
  description: string | undefined;
  country: string | undefined;
  imageId: ImageId | undefined;
  followers: number;
  interestIds: UserCategoryId[];
  placeId: PlaceId | undefined;
  acceptedCGU: boolean;
  acceptedAt: Date;
  emailVerified: boolean;
  emailVerificationTokenHash: string | undefined;
  emailVerificationExpiresAt: Date | undefined;
  resetPasswordTokenHash: string | undefined;
  resetPasswordExpiresAt: Date | undefined;
  googleId: string | undefined;
  googlePictureUrl: string | undefined;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
};

export class User {
  private constructor(
    public readonly id: UserId | null,
    public readonly firstname: string | undefined,
    public readonly lastname: string | undefined,
    public readonly username: string | undefined,
    public readonly userCategoryId: UserCategoryId | undefined,
    public readonly email: string,
    public readonly website: string | undefined,
    public readonly phone: string | undefined,
    public readonly passwordHash: string | undefined,
    public readonly userType: UserType,
    public readonly role: UserRole,
    public readonly deleted: boolean,
    public readonly bannedAt: Date | undefined,
    public readonly banReason: string | undefined,
    public readonly banDuration: number | undefined,
    public readonly banExpiresAt: Date | undefined,
    public readonly lastLogin: Date | undefined,
    public readonly address: UserAddress | undefined,
    public readonly description: string | undefined,
    public readonly country: string | undefined,
    public readonly imageId: ImageId | undefined,
    public readonly followers: number,
    public readonly interestIds: UserCategoryId[],
    public readonly placeId: PlaceId | undefined,
    public readonly acceptedCGU: boolean,
    public readonly acceptedAt: Date,
    public readonly emailVerified: boolean,
    public readonly emailVerificationTokenHash: string | undefined,
    public readonly emailVerificationExpiresAt: Date | undefined,
    public readonly resetPasswordTokenHash: string | undefined,
    public readonly resetPasswordExpiresAt: Date | undefined,
    public readonly googleId: string | undefined,
    public readonly googlePictureUrl: string | undefined,
    public readonly preferences: UserPreferences,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  private static fromProps(props: UserProps): User {
    return new User(
      props.id,
      props.firstname,
      props.lastname,
      props.username,
      props.userCategoryId,
      props.email,
      props.website,
      props.phone,
      props.passwordHash,
      props.userType,
      props.role,
      props.deleted,
      props.bannedAt,
      props.banReason,
      props.banDuration,
      props.banExpiresAt,
      props.lastLogin,
      props.address,
      props.description,
      props.country,
      props.imageId,
      props.followers,
      props.interestIds,
      props.placeId,
      props.acceptedCGU,
      props.acceptedAt,
      props.emailVerified,
      props.emailVerificationTokenHash,
      props.emailVerificationExpiresAt,
      props.resetPasswordTokenHash,
      props.resetPasswordExpiresAt,
      props.googleId,
      props.googlePictureUrl,
      props.preferences,
      props.createdAt,
      props.updatedAt
    );
  }

  private clone(overrides: Partial<UserProps>): User {
    return User.fromProps({
      id: this.id,
      firstname: this.firstname,
      lastname: this.lastname,
      username: this.username,
      userCategoryId: this.userCategoryId,
      email: this.email,
      website: this.website,
      phone: this.phone,
      passwordHash: this.passwordHash,
      userType: this.userType,
      role: this.role,
      deleted: this.deleted,
      bannedAt: this.bannedAt,
      banReason: this.banReason,
      banDuration: this.banDuration,
      banExpiresAt: this.banExpiresAt,
      lastLogin: this.lastLogin,
      address: this.address,
      description: this.description,
      country: this.country,
      imageId: this.imageId,
      followers: this.followers,
      interestIds: this.interestIds,
      placeId: this.placeId,
      acceptedCGU: this.acceptedCGU,
      acceptedAt: this.acceptedAt,
      emailVerified: this.emailVerified,
      emailVerificationTokenHash: this.emailVerificationTokenHash,
      emailVerificationExpiresAt: this.emailVerificationExpiresAt,
      resetPasswordTokenHash: this.resetPasswordTokenHash,
      resetPasswordExpiresAt: this.resetPasswordExpiresAt,
      googleId: this.googleId,
      googlePictureUrl: this.googlePictureUrl,
      preferences: this.preferences,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      ...overrides,
    });
  }

  static register(params: RegisterUserParams): User {
    const now = new Date();
    return User.fromProps({
      id: null,
      firstname: undefined,
      lastname: undefined,
      username: undefined,
      userCategoryId: undefined,
      email: params.email,
      website: undefined,
      phone: undefined,
      passwordHash: params.passwordHash,
      userType: "guest",
      role: "user",
      deleted: false,
      bannedAt: undefined,
      banReason: undefined,
      banDuration: undefined,
      banExpiresAt: undefined,
      lastLogin: undefined,
      address: undefined,
      description: undefined,
      country: undefined,
      imageId: undefined,
      followers: 0,
      interestIds: [],
      placeId: undefined,
      acceptedCGU: params.acceptedCGU,
      acceptedAt: now,
      emailVerified: false,
      emailVerificationTokenHash: params.emailVerificationTokenHash,
      emailVerificationExpiresAt: params.emailVerificationExpiresAt,
      resetPasswordTokenHash: undefined,
      resetPasswordExpiresAt: undefined,
      googleId: undefined,
      googlePictureUrl: undefined,
      preferences: UserPreferences.from({
        emailNotifications: params.emailNotifications === true,
      }),
      createdAt: now,
      updatedAt: now,
    });
  }

  static registerFromGoogle(params: RegisterFromGoogleParams): User {
    const now = new Date();
    return User.fromProps({
      id: null,
      firstname: params.firstname,
      lastname: params.lastname,
      username: undefined,
      userCategoryId: undefined,
      email: params.email,
      website: undefined,
      phone: undefined,
      passwordHash: params.passwordHash,
      userType: "guest",
      role: "user",
      deleted: false,
      bannedAt: undefined,
      banReason: undefined,
      banDuration: undefined,
      banExpiresAt: undefined,
      lastLogin: undefined,
      address: undefined,
      description: undefined,
      country: undefined,
      imageId: undefined,
      followers: 0,
      interestIds: [],
      placeId: undefined,
      acceptedCGU: false,
      acceptedAt: new Date(0),
      emailVerified: true,
      emailVerificationTokenHash: undefined,
      emailVerificationExpiresAt: undefined,
      resetPasswordTokenHash: undefined,
      resetPasswordExpiresAt: undefined,
      googleId: params.googleId,
      googlePictureUrl: params.googlePictureUrl,
      preferences: UserPreferences.from({ emailNotifications: false }),
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(params: ReconstituteUserParams): User {
    return User.fromProps({
      id: params.id,
      firstname: params.firstname,
      lastname: params.lastname,
      username: params.username,
      userCategoryId: params.userCategoryId,
      email: params.email,
      website: params.website,
      phone: params.phone,
      passwordHash: params.passwordHash,
      userType: params.userType,
      role: params.role,
      deleted: params.deleted,
      bannedAt: params.bannedAt,
      banReason: params.banReason,
      banDuration: params.banDuration,
      banExpiresAt: params.banExpiresAt,
      lastLogin: params.lastLogin,
      address: params.address,
      description: params.description,
      country: params.country,
      imageId: params.imageId,
      followers: params.followers,
      interestIds: params.interestIds,
      placeId: params.placeId,
      acceptedCGU: params.acceptedCGU ?? false,
      acceptedAt: params.acceptedAt ?? new Date(0),
      emailVerified: params.emailVerified !== false,
      emailVerificationTokenHash: params.emailVerificationTokenHash,
      emailVerificationExpiresAt: params.emailVerificationExpiresAt,
      resetPasswordTokenHash: params.resetPasswordTokenHash,
      resetPasswordExpiresAt: params.resetPasswordExpiresAt,
      googleId: params.googleId,
      googlePictureUrl: params.googlePictureUrl,
      preferences: params.preferences,
      createdAt: params.createdAt,
      updatedAt: params.updatedAt,
    });
  }

  updateProfile(params: UpdateUserProfileParams): User {
    return this.clone({
      firstname:
        params.firstname !== undefined ? params.firstname : this.firstname,
      lastname: params.lastname !== undefined ? params.lastname : this.lastname,
      username: params.username !== undefined ? params.username : this.username,
      userCategoryId:
        params.userCategoryId !== undefined
          ? params.userCategoryId
          : this.userCategoryId,
      website: params.website !== undefined ? params.website : this.website,
      phone: params.phone !== undefined ? params.phone : this.phone,
      userType: params.userType ?? this.userType,
      address: params.address !== undefined ? params.address : this.address,
      description:
        params.description !== undefined ? params.description : this.description,
      country: params.country !== undefined ? params.country : this.country,
      imageId: params.imageId !== undefined ? params.imageId : this.imageId,
      interestIds: params.interestIds ?? this.interestIds,
      googlePictureUrl:
        params.googlePictureUrl !== undefined
          ? params.googlePictureUrl
          : this.googlePictureUrl,
      preferences: params.preferences ?? this.preferences,
      updatedAt: new Date(),
    });
  }

  linkPlace(placeId: PlaceId): User {
    return this.clone({ placeId, updatedAt: new Date() });
  }

  unlinkPlace(): User {
    return this.clone({ placeId: undefined, updatedAt: new Date() });
  }

  hasPlace(): boolean {
    return this.placeId !== undefined;
  }

  isBanActive(now = new Date()): boolean {
    if (!this.bannedAt) return false;
    if (!this.banExpiresAt) return true;
    return this.banExpiresAt.getTime() > now.getTime();
  }

  getBanMessage(): string {
    const reason = this.banReason || "aucune raison communiquée";
    const until = this.banExpiresAt
      ? ` jusqu'au ${this.banExpiresAt.toLocaleDateString("fr-FR")}`
      : "";
    return `Votre compte a été banni${until}. Raison : ${reason}.`;
  }

  assertCanAuthenticate(options: AssertCanAuthenticateOptions = {}): void {
    const { requireEmailVerified = false } = options;

    if (requireEmailVerified && this.emailVerified === false) {
      throw new ForbiddenError(
        ERROR_CODES.AUTH_EMAIL_NOT_VERIFIED,
        "Veuillez vérifier votre adresse email avant de vous connecter. Consultez votre boîte de réception ou demandez un nouveau lien."
      );
    }
    if (this.deleted) {
      throw new ForbiddenError(
        ERROR_CODES.AUTH_ACCOUNT_INACCESSIBLE,
        "Ce compte n'est plus accessible"
      );
    }
    if (this.isBanActive()) {
      throw new ForbiddenError(ERROR_CODES.AUTH_USER_BANNED, this.getBanMessage());
    }
  }

  verifyEmail(): User {
    return this.clone({
      emailVerified: true,
      emailVerificationTokenHash: undefined,
      emailVerificationExpiresAt: undefined,
      updatedAt: new Date(),
    });
  }

  acceptCgu(emailNotifications?: boolean): User {
    return this.clone({
      acceptedCGU: true,
      acceptedAt: new Date(),
      preferences: UserPreferences.from({
        emailNotifications: emailNotifications === true,
      }),
      updatedAt: new Date(),
    });
  }

  recordLogin(): User {
    return this.clone({ lastLogin: new Date(), updatedAt: new Date() });
  }

  setEmailVerificationToken(tokenHash: string, expiresAt: Date): User {
    return this.clone({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: expiresAt,
      updatedAt: new Date(),
    });
  }

  setPasswordResetToken(tokenHash: string, expiresAt: Date): User {
    return this.clone({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: expiresAt,
      updatedAt: new Date(),
    });
  }

  clearPasswordResetToken(): User {
    return this.clone({
      resetPasswordTokenHash: undefined,
      resetPasswordExpiresAt: undefined,
      updatedAt: new Date(),
    });
  }

  setPasswordHash(passwordHash: string): User {
    return this.clone({
      passwordHash,
      resetPasswordTokenHash: undefined,
      resetPasswordExpiresAt: undefined,
      updatedAt: new Date(),
    });
  }

  linkGoogleAccount(params: {
    googleId: string;
    googlePictureUrl?: string;
  }): User {
    return this.clone({
      googleId: params.googleId,
      googlePictureUrl:
        params.googlePictureUrl !== undefined
          ? params.googlePictureUrl
          : this.googlePictureUrl,
      updatedAt: new Date(),
    });
  }

  mergeUnverifiedWithGoogle(params: {
    googleId: string;
    passwordHash: string;
    googlePictureUrl?: string;
  }): User {
    return this.clone({
      googleId: params.googleId,
      passwordHash: params.passwordHash,
      emailVerified: true,
      emailVerificationTokenHash: undefined,
      emailVerificationExpiresAt: undefined,
      googlePictureUrl:
        params.googlePictureUrl !== undefined
          ? params.googlePictureUrl
          : this.googlePictureUrl,
      updatedAt: new Date(),
    });
  }

  withEmailNotificationPreference(emailNotifications: boolean): User {
    return this.clone({
      preferences: UserPreferences.from({ emailNotifications }),
      updatedAt: new Date(),
    });
  }

  ban(params: { reason: string; duration?: number; now?: Date }): User {
    const bannedAt = params.now ?? new Date();
    const banExpiresAt = params.duration
      ? new Date(bannedAt.getTime() + params.duration)
      : undefined;

    return this.clone({
      bannedAt,
      banReason: params.reason,
      banDuration: params.duration,
      banExpiresAt,
      updatedAt: bannedAt,
    });
  }

  unban(): User {
    return this.clone({
      bannedAt: undefined,
      banReason: undefined,
      banDuration: undefined,
      banExpiresAt: undefined,
      updatedAt: new Date(),
    });
  }

  softDelete(): User {
    return this.clone({ deleted: true, updatedAt: new Date() });
  }

  restore(): User {
    return this.clone({ deleted: false, updatedAt: new Date() });
  }
}
