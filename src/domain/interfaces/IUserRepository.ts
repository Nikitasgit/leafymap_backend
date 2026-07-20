import { User, UserType } from "@src/domain/entities/User.entity";
import {
  UserDetailsReadModel,
  UserListItemReadModel,
} from "@src/domain/read-models/user.read-models";
import { PlaceId, UserId } from "@src/domain/value-objects/ObjectId.vo";

export interface UserListFilters {
  username?: string;
  userType?: UserType;
  excludeIds?: string[];
  limit?: number;
}

export type UserDetailsView = "default" | "profile" | "current" | "admin";

export interface FindUserDetailsOptions {
  view?: UserDetailsView;
  includeDeleted?: boolean;
}

export interface IUserRepository {
  create(user: User): Promise<UserId>;
  update(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByEmailOrUsername(identifier: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  findByEmailVerificationTokenHash(tokenHash: string): Promise<User | null>;
  findByResetPasswordTokenHash(tokenHash: string): Promise<User | null>;
  findDetailsById(
    id: UserId,
    options?: FindUserDetailsOptions
  ): Promise<UserDetailsReadModel | null>;
  findList(filters: UserListFilters): Promise<UserListItemReadModel[]>;
  findAdminByEmail(
    email: string,
    limit?: number
  ): Promise<UserDetailsReadModel[]>;
  incrementFollowers(id: UserId, delta: 1 | -1): Promise<void>;
  deleteOne(id: UserId): Promise<void>;
  linkPlace(userId: UserId, placeId: PlaceId): Promise<void>;
  unlinkPlace(userId: UserId): Promise<void>;
}
