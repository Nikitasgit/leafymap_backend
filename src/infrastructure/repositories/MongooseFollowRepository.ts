import { IFollowRepository } from "@src/domain/interfaces/IFollowRepository";
import { Follow } from "@src/domain/entities/Follow.entity";
import {
  FollowingUserProfileReadModel,
  FollowUserProfileReadModel,
} from "@src/domain/read-models/follow.read-models";
import { FollowId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import { FollowMapper } from "@src/infrastructure/mappers/Follow.mapper";
import { FollowReadMapper } from "@src/infrastructure/read-mappers/Follow.read-mapper";
import FollowModel from "@src/infrastructure/persistence/schemas/Follow.schema";
import { userWithImagePopulate } from "@src/infrastructure/persistence/utils/populatePresets";
import { Types } from "mongoose";

export const FOLLOWER_POPULATE = userWithImagePopulate(
  "follower",
  "_id username firstname lastname image userType"
);
export const FOLLOWING_POPULATE = userWithImagePopulate(
  "following",
  "_id username firstname lastname image userType"
);

class MongooseFollowRepository implements IFollowRepository {
  async save(follow: Follow): Promise<FollowId> {
    const document = await FollowModel.create(
      FollowMapper.toPersistence(follow)
    );
    return FollowId.from(document._id.toString());
  }

  async findById(id: FollowId): Promise<Follow | null> {
    const document = await FollowModel.findById(id).lean();
    if (!document) {
      return null;
    }
    return FollowMapper.toDomain(
      document as FollowDocumentWithId
    );
  }

  async findByPair(
    followerId: UserId,
    followingId: UserId
  ): Promise<Follow | null> {
    const document = await FollowModel.findOne({
      follower: new Types.ObjectId(followerId),
      following: new Types.ObjectId(followingId),
    }).lean();

    if (!document) {
      return null;
    }

    return FollowMapper.toDomain(
      document as FollowDocumentWithId
    );
  }

  async findFollowersOf(
    userId: UserId
  ): Promise<FollowUserProfileReadModel[]> {
    const documents = await FollowModel.find({
      following: new Types.ObjectId(userId),
    })
      .select("_id follower")
      .populate(FOLLOWER_POPULATE)
      .sort({ createdAt: -1 })
      .lean();

    return FollowReadMapper.toFollowerProfiles(documents);
  }

  async findFollowingOf(
    userId: UserId
  ): Promise<FollowingUserProfileReadModel[]> {
    const documents = await FollowModel.find({
      follower: new Types.ObjectId(userId),
    })
      .select("_id following")
      .populate(FOLLOWING_POPULATE)
      .sort({ createdAt: -1 })
      .lean();

    return FollowReadMapper.toFollowingProfiles(documents);
  }

  async delete(id: FollowId): Promise<void> {
    await FollowModel.findByIdAndDelete(id).exec();
  }

  async deleteAllInvolvingUser(userId: UserId): Promise<void> {
    const objectId = new Types.ObjectId(userId);
    await FollowModel.deleteMany({
      $or: [{ follower: objectId }, { following: objectId }],
    }).exec();
  }
}

type FollowDocumentWithId = {
  _id: Types.ObjectId;
  follower: Types.ObjectId;
  following: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

export default MongooseFollowRepository;
