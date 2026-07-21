import {
  ImageReferenceReadModel,
  LocationReadModel,
} from "@src/domain/read-models/shared.read-models";

export type UserImageReadModel = ImageReferenceReadModel;

export interface UserCategoryTypeReadModel {
  id: string;
  name?: string;
}

export interface UserCategoryReadModel {
  id: string;
  name?: string;
  type?: UserCategoryTypeReadModel | string;
}

export interface UserPlaceCategoryReadModel {
  id: string;
  name?: string;
}

export interface UserPlaceReadModel {
  id: string;
  location?: LocationReadModel;
  rating?: number;
  placeCategory?: UserPlaceCategoryReadModel | string;
}

export interface UserAddressReadModel {
  number?: string;
  street?: string;
  code?: string;
  extra?: string;
}

export interface UserPreferencesReadModel {
  emailNotifications?: boolean;
}

/** Shared fields across the different user list/detail views. */
export interface UserListItemReadModel {
  id: string;
  firstname?: string;
  lastname?: string;
  username?: string;
  userType?: "creator" | "guest";
  email?: string;
  website?: string;
  phone?: string;
  description?: string;
  country?: string;
  followers?: number;
  place?: UserPlaceReadModel | string | null;
  image?: UserImageReadModel | string | null;
  googlePictureUrl?: string;
  userCategory?: UserCategoryReadModel | string;
}

/**
 * Detail view: superset of list fields plus profile/current/admin-only
 * fields (role, ban info, timestamps, address, preferences, etc.).
 */
export interface UserDetailsReadModel extends UserListItemReadModel {
  role?: "user" | "admin";
  deleted?: boolean;
  acceptedCGU?: boolean;
  address?: UserAddressReadModel;
  preferences?: UserPreferencesReadModel;
  bannedAt?: string | Date | null;
  banReason?: string;
  banDuration?: number;
  banExpiresAt?: string | Date | null;
  lastLogin?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
