import { Follow } from "@src/domain/entities/Follow.entity";
import { FollowId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import { FollowDocumentProps } from "@src/infrastructure/persistence/schemas/Follow.schema";
import { Types } from "mongoose";

export class FollowMapper {
  static toDomain(
    doc: FollowDocumentProps & { _id: Types.ObjectId }
  ): Follow {
    return Follow.reconstitute({
      id: FollowId.from(doc._id.toString()),
      followerId: UserId.from(doc.follower.toString()),
      followingId: UserId.from(doc.following.toString()),
      createdAt: doc.createdAt ?? new Date(),
    });
  }

  static toPersistence(follow: Follow): Omit<FollowDocumentProps, "_id"> {
    return {
      follower: new Types.ObjectId(follow.followerId),
      following: new Types.ObjectId(follow.followingId),
    };
  }
}
