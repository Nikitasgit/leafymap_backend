import {
  FollowingUserProfile,
  FollowUserProfile,
  IFollowRepository,
} from "@src/domain/interfaces/IFollowRepository";
import { Follow } from "@src/domain/entities/Follow.entity";
import { FollowId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import { FollowMapper } from "@src/infrastructure/mappers/Follow.mapper";
import FollowModel from "@src/infrastructure/persistence/schemas/Follow.schema";
import { Types } from "mongoose";

type PopulatedUser = {
  _id: Types.ObjectId;
  username?: string;
  firstname?: string;
  lastname?: string;
  image?: FollowUserProfile["image"];
  userType: "creator" | "guest";
};

type FollowWithFollower = {
  _id: Types.ObjectId;
  follower: PopulatedUser;
};

type FollowWithFollowing = {
  _id: Types.ObjectId;
  following: PopulatedUser;
};

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

  async findFollowersOf(userId: UserId): Promise<FollowUserProfile[]> {
    const documents = await FollowModel.find({
      following: new Types.ObjectId(userId),
    })
      .select("_id follower")
      .populate({
        path: "follower",
        select: "_id username firstname lastname image.urls userType",
      })
      .sort({ createdAt: -1 })
      .lean();

    return (documents as unknown as FollowWithFollower[]).map((follow) => {
      const follower = follow.follower;
      return {
        _id: follower._id.toString(),
        username: follower.username,
        firstname: follower.firstname,
        lastname: follower.lastname,
        image: follower.image,
        userType: follower.userType,
      };
    });
  }

  async findFollowingOf(userId: UserId): Promise<FollowingUserProfile[]> {
    const documents = await FollowModel.find({
      follower: new Types.ObjectId(userId),
    })
      .select("_id following")
      .populate({
        path: "following",
        select: "_id username firstname lastname image.urls userType",
      })
      .sort({ createdAt: -1 })
      .lean();

    return (documents as unknown as FollowWithFollowing[]).map((follow) => {
      const following = follow.following;
      return {
        _id: following._id.toString(),
        followId: follow._id.toString(),
        username: following.username,
        firstname: following.firstname,
        lastname: following.lastname,
        image: following.image,
        userType: following.userType,
      };
    });
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
