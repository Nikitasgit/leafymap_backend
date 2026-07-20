import { Partnership } from "@src/domain/entities/Partnership.entity";
import {
  PartnershipId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { PartnershipStatus } from "@src/domain/value-objects/PartnershipStatus.vo";

export interface PartnershipUserListFilters {
  userId: UserId;
  asCollaborator?: boolean;
  asInitiator?: boolean;
  status?: PartnershipStatus;
  currentUserId?: UserId;
}

export interface IPartnershipRepository {
  save(partnership: Partnership): Promise<PartnershipId>;
  findById(id: PartnershipId): Promise<Partnership | null>;
  update(partnership: Partnership): Promise<void>;

  findExistingBetweenUsers(
    userA: UserId,
    userB: UserId
  ): Promise<Partnership | null>;

  findListForUser(
    filters: PartnershipUserListFilters
  ): Promise<Record<string, unknown>[]>;

  deleteManyByUserId(userId: UserId): Promise<void>;
}
