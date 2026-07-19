import { User } from "@src/domain/entities/User.entity";
import {
  ImageId,
  PlaceId,
  UserCategoryId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { UserAddress } from "@src/domain/value-objects/UserAddress.vo";
import { UserPreferences } from "@src/domain/value-objects/UserPreferences.vo";
import { UserDocumentProps } from "@src/infrastructure/persistence/schemas/User.schema";
import { Types } from "mongoose";

type UserDocumentWithId = UserDocumentProps & { _id: Types.ObjectId };

const toOptionalId = <T extends string>(
  value: Types.ObjectId | undefined,
  brand: (v: string) => T
): T | undefined => (value ? brand(value.toString()) : undefined);

export class UserMapper {
  static toDomain(doc: UserDocumentWithId): User {
    return User.reconstitute({
      id: UserId.from(doc._id.toString()),
      firstname: doc.firstname,
      lastname: doc.lastname,
      username: doc.username,
      userCategoryId: toOptionalId(doc.userCategory, UserCategoryId.from),
      email: doc.email,
      website: doc.website,
      phone: doc.phone,
      passwordHash: doc.password,
      userType: doc.userType,
      role: doc.role,
      deleted: doc.deleted ?? false,
      bannedAt: doc.bannedAt,
      banReason: doc.banReason,
      banDuration: doc.banDuration,
      banExpiresAt: doc.banExpiresAt,
      lastLogin: doc.lastLogin,
      address: doc.address ? UserAddress.from(doc.address) : undefined,
      description: doc.description,
      country: doc.country,
      imageId: toOptionalId(doc.image, ImageId.from),
      followers: doc.followers ?? 0,
      interestIds: (doc.interests ?? []).map((id) =>
        UserCategoryId.from(id.toString())
      ),
      placeId: toOptionalId(doc.place, PlaceId.from),
      acceptedCGU: doc.acceptedCGU,
      acceptedAt: doc.acceptedAt,
      emailVerified: doc.emailVerified,
      emailVerificationTokenHash: doc.emailVerificationTokenHash,
      emailVerificationExpiresAt: doc.emailVerificationExpiresAt,
      resetPasswordTokenHash: doc.resetPasswordTokenHash,
      resetPasswordExpiresAt: doc.resetPasswordExpiresAt,
      googleId: doc.googleId,
      googlePictureUrl: doc.googlePictureUrl,
      preferences: UserPreferences.from(doc.preferences ?? {}),
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
    });
  }

  static toCreatePersistence(user: User): Partial<UserDocumentProps> {
    return {
      email: user.email,
      password: user.passwordHash!,
      firstname: user.firstname,
      lastname: user.lastname,
      userType: user.userType,
      role: user.role,
      deleted: user.deleted,
      acceptedCGU: user.acceptedCGU,
      acceptedAt: user.acceptedAt,
      emailVerified: user.emailVerified,
      emailVerificationTokenHash: user.emailVerificationTokenHash,
      emailVerificationExpiresAt: user.emailVerificationExpiresAt,
      googleId: user.googleId,
      googlePictureUrl: user.googlePictureUrl,
      preferences: {
        emailNotifications: user.preferences.emailNotifications,
      },
      followers: user.followers,
    };
  }

  static toProfilePersistence(user: User): {
    firstname?: string;
    lastname?: string;
    username?: string;
    userCategory?: Types.ObjectId;
    website?: string;
    phone?: string;
    userType: "creator" | "guest";
    address?: {
      number?: string;
      street: string;
      code: string;
      extra?: string;
    };
    description?: string;
    country?: string;
    image?: Types.ObjectId;
    interests: Types.ObjectId[];
    place?: Types.ObjectId;
    googlePictureUrl?: string;
    preferences: { emailNotifications?: boolean };
    updatedAt: Date;
  } {
    return {
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      userCategory: user.userCategoryId
        ? new Types.ObjectId(user.userCategoryId)
        : undefined,
      website: user.website,
      phone: user.phone,
      userType: user.userType,
      address: user.address
        ? {
            number: user.address.number,
            street: user.address.street,
            code: user.address.code,
            extra: user.address.extra,
          }
        : undefined,
      description: user.description,
      country: user.country,
      image: user.imageId ? new Types.ObjectId(user.imageId) : undefined,
      interests: user.interestIds.map((id) => new Types.ObjectId(id)),
      place: user.placeId ? new Types.ObjectId(user.placeId) : undefined,
      googlePictureUrl: user.googlePictureUrl,
      preferences: {
        emailNotifications: user.preferences.emailNotifications,
      },
      updatedAt: user.updatedAt,
    };
  }

  static toAuthPersistence(user: User): {
    set: Record<string, unknown>;
    unset: Record<string, 1>;
  } {
    const set: Record<string, unknown> = {
      acceptedCGU: user.acceptedCGU,
      acceptedAt: user.acceptedAt,
      emailVerified: user.emailVerified,
      deleted: user.deleted,
      preferences: {
        emailNotifications: user.preferences.emailNotifications,
      },
      updatedAt: user.updatedAt,
    };
    const unset: Record<string, 1> = {};

    if (user.passwordHash !== undefined) {
      set.password = user.passwordHash;
    }
    if (user.lastLogin !== undefined) {
      set.lastLogin = user.lastLogin;
    }
    if (user.googleId !== undefined) {
      set.googleId = user.googleId;
    }
    if (user.googlePictureUrl !== undefined) {
      set.googlePictureUrl = user.googlePictureUrl;
    }

    if (user.bannedAt !== undefined) {
      set.bannedAt = user.bannedAt;
    } else {
      unset.bannedAt = 1;
    }
    if (user.banReason !== undefined) {
      set.banReason = user.banReason;
    } else {
      unset.banReason = 1;
    }
    if (user.banDuration !== undefined) {
      set.banDuration = user.banDuration;
    } else {
      unset.banDuration = 1;
    }
    if (user.banExpiresAt !== undefined) {
      set.banExpiresAt = user.banExpiresAt;
    } else {
      unset.banExpiresAt = 1;
    }

    if (user.emailVerificationTokenHash !== undefined) {
      set.emailVerificationTokenHash = user.emailVerificationTokenHash;
    } else {
      unset.emailVerificationTokenHash = 1;
    }
    if (user.emailVerificationExpiresAt !== undefined) {
      set.emailVerificationExpiresAt = user.emailVerificationExpiresAt;
    } else {
      unset.emailVerificationExpiresAt = 1;
    }
    if (user.resetPasswordTokenHash !== undefined) {
      set.resetPasswordTokenHash = user.resetPasswordTokenHash;
    } else {
      unset.resetPasswordTokenHash = 1;
    }
    if (user.resetPasswordExpiresAt !== undefined) {
      set.resetPasswordExpiresAt = user.resetPasswordExpiresAt;
    } else {
      unset.resetPasswordExpiresAt = 1;
    }

    return { set, unset };
  }
}
