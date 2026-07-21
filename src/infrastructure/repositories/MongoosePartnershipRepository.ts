import { IPartnershipRepository } from "@src/domain/interfaces/IPartnershipRepository";
import { PartnershipUserListFilters } from "@src/domain/interfaces/IPartnershipRepository";
import { Partnership } from "@src/domain/entities/Partnership.entity";
import {
  PartnershipId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { PartnershipMapper } from "@src/infrastructure/mappers/Partnership.mapper";
import PartnershipModel, {
  PartnershipDocumentProps,
} from "@src/infrastructure/persistence/schemas/Partnership.schema";
import { PartnershipListItemReadModel } from "@src/domain/read-models/partnership.read-models";
import { PartnershipReadMapper } from "@src/infrastructure/read-mappers/Partnership.read-mapper";
import { assertPersistedId } from "@src/infrastructure/persistence/utils/assertPersistedId";
import { FilterQuery, Types } from "mongoose";

type PartnershipDocumentWithId = PartnershipDocumentProps & {
  _id: Types.ObjectId;
};

const USER_LIST_POPULATE = [
  {
    path: "initiator",
    select: "_id username image userCategory",
    populate: [
      { path: "image", select: "urls" },
      { path: "userCategory", select: "name" },
    ],
  },
  {
    path: "collaborator",
    select: "_id username image userCategory",
    populate: [
      { path: "image", select: "urls" },
      { path: "userCategory", select: "name" },
    ],
  },
];

export function buildPartnershipUserQuery(
  filters: PartnershipUserListFilters
): FilterQuery<PartnershipDocumentProps> {
  const query: FilterQuery<PartnershipDocumentProps> = { deleted: false };
  const andConditions: FilterQuery<PartnershipDocumentProps>[] = [];

  if (filters.asCollaborator === true) {
    query.collaborator = new Types.ObjectId(filters.userId);
  } else if (filters.asInitiator === true) {
    query.initiator = new Types.ObjectId(filters.userId);
  } else {
    andConditions.push({
      $or: [
        { initiator: new Types.ObjectId(filters.userId) },
        { collaborator: new Types.ObjectId(filters.userId) },
      ],
    });
  }

  if (filters.status) {
    query.status = filters.status;
  } else if (!filters.currentUserId) {
    query.status = "accepted";
  }

  if (filters.currentUserId) {
    andConditions.push({
      $or: [
        { status: "accepted" },
        { initiator: new Types.ObjectId(filters.currentUserId) },
        { collaborator: new Types.ObjectId(filters.currentUserId) },
      ],
    });
  }

  if (andConditions.length > 0) {
    query.$and = andConditions;
  }

  return query;
}

class MongoosePartnershipRepository implements IPartnershipRepository {
  async save(partnership: Partnership): Promise<PartnershipId> {
    const document = await PartnershipModel.create(
      PartnershipMapper.toPersistence(partnership)
    );
    return PartnershipId.from(document._id.toString());
  }

  async findById(id: PartnershipId): Promise<Partnership | null> {
    const document = await PartnershipModel.findById(id).lean();
    if (!document) {
      return null;
    }
    return PartnershipMapper.toDomain(document as PartnershipDocumentWithId);
  }

  async update(partnership: Partnership): Promise<void> {
    const id = assertPersistedId("partnership", partnership.id);
    await PartnershipModel.updateOne(
      { _id: id },
      {
        status: partnership.status,
        deleted: partnership.deleted,
        updatedAt: partnership.updatedAt,
      }
    ).exec();
  }

  async findExistingBetweenUsers(
    userA: UserId,
    userB: UserId
  ): Promise<Partnership | null> {
    const a = new Types.ObjectId(userA);
    const b = new Types.ObjectId(userB);
    const document = await PartnershipModel.findOne({
      deleted: false,
      $or: [
        { initiator: a, collaborator: b },
        { initiator: b, collaborator: a },
      ],
    }).lean();

    if (!document) {
      return null;
    }
    return PartnershipMapper.toDomain(document as PartnershipDocumentWithId);
  }

  async findListForUser(
    filters: PartnershipUserListFilters
  ): Promise<PartnershipListItemReadModel[]> {
    const query = buildPartnershipUserQuery(filters);
    const partnerships = await PartnershipModel.find(query)
      .select("_id initiator collaborator status deleted updatedAt")
      .populate(USER_LIST_POPULATE)
      .sort({ updatedAt: -1 })
      .lean();

    return PartnershipReadMapper.toListItems(partnerships);
  }

  async deleteManyByUserId(userId: UserId): Promise<void> {
    const typedUserId = new Types.ObjectId(userId);
    await PartnershipModel.deleteMany({
      $or: [{ initiator: typedUserId }, { collaborator: typedUserId }],
    }).exec();
  }

}

export default MongoosePartnershipRepository;
