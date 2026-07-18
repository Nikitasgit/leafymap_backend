import { Partnership } from "@src/domain/entities/Partnership.entity";
import {
  PartnershipId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { PartnershipStatus } from "@src/domain/value-objects/PartnershipStatus.vo";
import { PartnershipDocumentProps } from "@src/infrastructure/persistence/schemas/Partnership.schema";
import { Types } from "mongoose";

export class PartnershipMapper {
  static toDomain(
    doc: PartnershipDocumentProps & { _id: Types.ObjectId }
  ): Partnership {
    return Partnership.reconstitute({
      id: PartnershipId.from(doc._id.toString()),
      initiatorId: UserId.from(doc.initiator.toString()),
      collaboratorId: UserId.from(doc.collaborator.toString()),
      status: PartnershipStatus.from(doc.status),
      deleted: doc.deleted ?? false,
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
    });
  }

  static toPersistence(
    partnership: Partnership
  ): Omit<PartnershipDocumentProps, "_id"> {
    return {
      initiator: new Types.ObjectId(partnership.initiatorId),
      collaborator: new Types.ObjectId(partnership.collaboratorId),
      status: partnership.status,
      deleted: partnership.deleted,
    };
  }
}
