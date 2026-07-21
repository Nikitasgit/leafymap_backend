import { User } from "@src/domain/entities/User.entity";
import {
  FindUserDetailsOptions,
  IUserRepository,
  UserDetailsView,
  UserListFilters,
} from "@src/domain/interfaces/IUserRepository";
import {
  UserDetailsReadModel,
  UserListItemReadModel,
} from "@src/domain/read-models/user.read-models";
import { PlaceId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import { UserMapper } from "@src/infrastructure/mappers/User.mapper";
import { UserReadMapper } from "@src/infrastructure/read-mappers/User.read-mapper";
import UserModel, {
  UserDocumentProps,
} from "@src/infrastructure/persistence/schemas/User.schema";
import { assertPersistedId } from "@src/infrastructure/persistence/utils/assertPersistedId";
import { imageUrlsPopulate } from "@src/infrastructure/persistence/utils/populatePresets";
import { FilterQuery, PopulateOptions, Types } from "mongoose";

type UserDocumentWithId = UserDocumentProps & { _id: Types.ObjectId };

interface UserDetailsQueryConfig {
  select: string;
  populate: PopulateOptions[];
}

const USER_CATEGORY_POPULATE: PopulateOptions = {
  path: "userCategory",
  select: "name type",
  populate: { path: "type", select: "name" },
};

export const USER_DETAILS_QUERY_CONFIGS: Record<
  UserDetailsView,
  UserDetailsQueryConfig
> = {
  default: {
    select:
      "_id firstname lastname username userType email website phone description country followers place image googlePictureUrl userCategory",
    populate: [
      {
        path: "place",
        select: "_id placeCategory location",
        populate: { path: "placeCategory", select: "name" },
      },
      imageUrlsPopulate,
      USER_CATEGORY_POPULATE,
    ],
  },
  profile: {
    select:
      "_id firstname lastname username userType email website phone description country followers place image googlePictureUrl userCategory",
    populate: [
      { path: "place", select: "_id" },
      imageUrlsPopulate,
      USER_CATEGORY_POPULATE,
    ],
  },
  current: {
    select:
      "_id email username firstname lastname userType role acceptedCGU website phone description country address followers place image googlePictureUrl userCategory bannedAt banReason banDuration banExpiresAt lastLogin preferences",
    populate: [
      {
        path: "place",
        select: "location placeCategory rating",
      },
      imageUrlsPopulate,
      { path: "userCategory", select: "name" },
    ],
  },
  admin: {
    select:
      "_id email username firstname lastname userType role deleted bannedAt banReason banDuration banExpiresAt lastLogin createdAt updatedAt place image",
    populate: [imageUrlsPopulate],
  },
};

const USER_LIST_POPULATE = [
  { path: "image", select: "urls" },
  {
    path: "userCategory",
    select: "name type",
    populate: { path: "type", select: "name" },
  },
  {
    path: "place",
    select: "location placeCategory",
    populate: { path: "placeCategory", select: "name" },
  },
];

class MongooseUserRepository implements IUserRepository {
  async create(user: User): Promise<UserId> {
    const document = await UserModel.create(UserMapper.toCreatePersistence(user));
    return UserId.from(document._id.toString());
  }

  async update(user: User): Promise<void> {
    const id = assertPersistedId("user", user.id);

    const persistence = UserMapper.toProfilePersistence(user);
    const auth = UserMapper.toAuthPersistence(user);
    const update: Record<string, unknown> = {
      firstname: persistence.firstname,
      lastname: persistence.lastname,
      username: persistence.username,
      website: persistence.website,
      phone: persistence.phone,
      userType: persistence.userType,
      description: persistence.description,
      country: persistence.country,
      googlePictureUrl: persistence.googlePictureUrl,
      preferences: persistence.preferences,
      interests: persistence.interests,
      updatedAt: persistence.updatedAt,
      ...auth.set,
    };

    if (persistence.userCategory) {
      update.userCategory = persistence.userCategory;
    }
    if (persistence.address) {
      update.address = persistence.address;
    }
    if (persistence.image) {
      update.image = persistence.image;
    }

    const unset: Record<string, 1> = { ...auth.unset };
    if (!user.placeId) {
      unset.place = 1;
    } else {
      update.place = new Types.ObjectId(user.placeId);
    }

    const mongoUpdate: Record<string, unknown> = { $set: update };
    if (Object.keys(unset).length > 0) {
      mongoUpdate.$unset = unset;
    }

    await UserModel.updateOne({ _id: id }, mongoUpdate).exec();
  }

  async findById(id: UserId): Promise<User | null> {
    const document = await UserModel.findById(id).lean();
    if (!document) {
      return null;
    }
    return UserMapper.toDomain(document as UserDocumentWithId);
  }

  async findByEmail(email: string): Promise<User | null> {
    const document = await UserModel.findOne({ email }).lean();
    if (!document) {
      return null;
    }
    return UserMapper.toDomain(document as UserDocumentWithId);
  }

  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    const document = await UserModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).lean();
    if (!document) {
      return null;
    }
    return UserMapper.toDomain(document as UserDocumentWithId);
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const document = await UserModel.findOne({ googleId }).lean();
    if (!document) {
      return null;
    }
    return UserMapper.toDomain(document as UserDocumentWithId);
  }

  async findByEmailVerificationTokenHash(
    tokenHash: string
  ): Promise<User | null> {
    const document = await UserModel.findOne({
      emailVerificationTokenHash: tokenHash,
    }).lean();
    if (!document) {
      return null;
    }
    return UserMapper.toDomain(document as UserDocumentWithId);
  }

  async findByResetPasswordTokenHash(tokenHash: string): Promise<User | null> {
    const document = await UserModel.findOne({
      resetPasswordTokenHash: tokenHash,
    }).lean();
    if (!document) {
      return null;
    }
    return UserMapper.toDomain(document as UserDocumentWithId);
  }

  async findDetailsById(
    id: UserId,
    options?: FindUserDetailsOptions
  ): Promise<UserDetailsReadModel | null> {
    const includeDeleted = options?.includeDeleted ?? false;
    const filter: FilterQuery<UserDocumentProps> = {
      _id: new Types.ObjectId(id),
    };
    if (!includeDeleted) {
      filter.deleted = false;
    }

    const config = USER_DETAILS_QUERY_CONFIGS[options?.view ?? "default"];
    const document = await UserModel.findOne(filter)
      .select(config.select)
      .populate(config.populate)
      .lean();
    if (!document) {
      return null;
    }
    return UserReadMapper.toDetail(document);
  }

  async findList(
    filters: UserListFilters
  ): Promise<UserListItemReadModel[]> {
    const query: FilterQuery<UserDocumentProps> = { deleted: false };

    if (filters.username) {
      query.username = { $regex: filters.username, $options: "i" };
    }
    if (filters.userType) {
      query.userType = filters.userType;
    }
    if (filters.excludeIds && filters.excludeIds.length > 0) {
      query._id = {
        $nin: filters.excludeIds.map((id) => new Types.ObjectId(id)),
      };
    }

    const documents = await UserModel.find(query)
      .select(
        "_id firstname lastname username userType description image googlePictureUrl userCategory place"
      )
      .populate(USER_LIST_POPULATE)
      .limit(filters.limit ?? 10)
      .lean();

    return UserReadMapper.toListItems(documents);
  }

  async findAdminByEmail(
    email: string,
    limit = 20
  ): Promise<UserDetailsReadModel[]> {
    const documents = await UserModel.find({
      email: { $regex: email, $options: "i" },
    })
      .select(
        "_id email username firstname lastname userType role deleted bannedAt banReason banExpiresAt lastLogin createdAt"
      )
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return UserReadMapper.toDetails(documents);
  }

  async incrementFollowers(id: UserId, delta: 1 | -1): Promise<void> {
    const filter =
      delta < 0
        ? { _id: new Types.ObjectId(id), followers: { $gt: 0 } }
        : { _id: new Types.ObjectId(id) };
    await UserModel.updateOne(filter, { $inc: { followers: delta } }).exec();
  }

  async deleteOne(id: UserId): Promise<void> {
    await UserModel.findByIdAndDelete(id).exec();
  }

  async linkPlace(userId: UserId, placeId: PlaceId): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      { place: new Types.ObjectId(placeId) }
    ).exec();
  }

  async unlinkPlace(userId: UserId): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      { $unset: { place: 1 } }
    ).exec();
  }
}

export default MongooseUserRepository;
