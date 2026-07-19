import { PartnershipStatus } from "@src/domain/value-objects/PartnershipStatus.vo";

export interface UpdatePartnershipItem {
  id: string;
  status?: Extract<PartnershipStatus, "pending" | "accepted">;
}

export interface UpdatePartnershipsInput {
  partnerships: UpdatePartnershipItem[];
  userId: string;
}
