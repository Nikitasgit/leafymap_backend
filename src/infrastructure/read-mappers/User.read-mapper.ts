import {
  UserDetailsReadModel,
  UserListItemReadModel,
} from "@src/domain/read-models/user.read-models";
import { normalizeLeanDocument } from "@src/infrastructure/persistence/utils/normalizeLeanDocument";

export class UserReadMapper {
  static toListItem(doc: unknown): UserListItemReadModel {
    return UserReadMapper.mapListFields(
      normalizeLeanDocument<UserListItemReadModel>(doc)
    );
  }

  static toListItems(docs: unknown[]): UserListItemReadModel[] {
    return docs.map((doc) => UserReadMapper.toListItem(doc));
  }

  static toDetail(doc: unknown): UserDetailsReadModel {
    const user = normalizeLeanDocument<UserDetailsReadModel>(doc);
    return {
      ...UserReadMapper.mapListFields(user),
      role: user.role,
      deleted: user.deleted,
      acceptedCGU: user.acceptedCGU,
      address: user.address,
      preferences: user.preferences,
      bannedAt: user.bannedAt,
      banReason: user.banReason,
      banDuration: user.banDuration,
      banExpiresAt: user.banExpiresAt,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toDetails(docs: unknown[]): UserDetailsReadModel[] {
    return docs.map((doc) => UserReadMapper.toDetail(doc));
  }

  private static mapListFields(
    user: UserListItemReadModel
  ): UserListItemReadModel {
    return {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      userType: user.userType,
      email: user.email,
      website: user.website,
      phone: user.phone,
      description: user.description,
      country: user.country,
      followers: user.followers,
      place: user.place,
      image: user.image,
      googlePictureUrl: user.googlePictureUrl,
      userCategory: user.userCategory,
    };
  }
}
