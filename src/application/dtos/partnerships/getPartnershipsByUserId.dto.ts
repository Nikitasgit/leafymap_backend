import { PartnershipStatus } from "@src/domain/value-objects/PartnershipStatus.vo";

export interface GetPartnershipsByUserIdInput {
  userId: string;
  asCollaborator?: boolean;
  asInitiator?: boolean;
  status?: PartnershipStatus;
  currentUserId?: string;
}
