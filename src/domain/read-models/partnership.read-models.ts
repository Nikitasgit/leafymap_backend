import {
  ImageReferenceReadModel,
  ReadModelDate,
} from "@src/domain/read-models/shared.read-models";
import { PartnershipStatus } from "@src/domain/value-objects/PartnershipStatus.vo";

export type PartnershipUserImageReadModel = ImageReferenceReadModel;

export interface PartnershipUserCategoryReadModel {
  id: string;
  name?: string;
}

export interface PartnershipUserReadModel {
  id: string;
  username?: string;
  image?: PartnershipUserImageReadModel | string | null;
  userCategory?: PartnershipUserCategoryReadModel | string;
}

/** List view returned by findListForUser. */
export interface PartnershipListItemReadModel {
  id: string;
  initiator?: PartnershipUserReadModel | string;
  collaborator?: PartnershipUserReadModel | string;
  status?: PartnershipStatus;
  deleted?: boolean;
  updatedAt?: ReadModelDate;
}
