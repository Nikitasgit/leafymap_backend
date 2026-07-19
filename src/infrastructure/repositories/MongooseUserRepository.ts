import { User } from "@src/domain/entities/User.entity";
import {
  FindUserDetailsOptions,
  IUserRepository,
  UserListFilters,
} from "@src/domain/interfaces/IUserRepository";
import { PlaceId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import { UserMapper } from "@src/infrastructure/mappers/User.mapper";
import UserModel, {
  UserDocumentProps,
} from "@src/infrastructure/persistence/schemas/User.schema";
import { PopulateParser } from "@src/infrastructure/persistence/utils/PopulateParser";
import { FilterQuery, Types } from "mongoose";

type UserDocumentWithId = UserDocumentProps & { _id: Types.ObjectId };

const DEFAULT_DETAILS_SELECT = [
  "_id",
  "firstname",
  "lastname",
  "username",
  "userType",
  "email",
  "website",
  "phone",
  "description",
  "country",
  "followers",
  "place",
  "image",
  "googlePictureUrl",
  "userCategory",
].join(" ");

const USER_DETAILS_POPULATE = [
  {
    path: "place",
    select: "_id placeCategory location",
    populate: { path: "placeCategory", select: "name" },
  },
  { path: "image", select: "urls" },
  {
    path: "userCategory",
    select: "name type",
    populate: { path: "type", select: "name" },
  },
];

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
    if (!user.id) {
      return;
    }

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

    await UserModel.updateOne({ _id: user.id }, mongoUpdate).exec();
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
  ): Promise<Record<string, unknown> | null> {
    const includeDeleted = options?.includeDeleted ?? false;
    const filter: FilterQuery<UserDocumentProps> = {
      _id: new Types.ObjectId(id),
    };
    if (!includeDeleted) {
      filter.deleted = false;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = UserModel.findOne(filter);

    if (options?.project && options.project.length > 0) {
      const { selectFields, populateConfig } =
        PopulateParser.parseProjectFields(options.project);
      if (selectFields.length > 0) {
        query = query.select(selectFields.join(" "));
      }
      query = PopulateParser.applyPopulate(query, populateConfig);
    } else {
      query = query
        .select(DEFAULT_DETAILS_SELECT)
        .populate(USER_DETAILS_POPULATE);
    }

    const document = await query.lean();
    if (!document) {
      return null;
    }
    return document as unknown as Record<string, unknown>;
  }

  async findList(
    filters: UserListFilters
  ): Promise<Record<string, unknown>[]> {
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

    return documents as unknown as Record<string, unknown>[];
  }

  async findAdminByEmail(
    email: string,
    limit = 20
  ): Promise<Record<string, unknown>[]> {
    const documents = await UserModel.find({
      email: { $regex: email, $options: "i" },
    })
      .select(
        "_id email username firstname lastname userType role deleted bannedAt banReason banExpiresAt lastLogin createdAt"
      )
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return documents as unknown as Record<string, unknown>[];
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
