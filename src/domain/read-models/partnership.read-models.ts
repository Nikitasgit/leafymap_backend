/**
 * Typed read models for Partnership query paths.
 * Produced by infrastructure Read Mappers (never raw Mongo docs).
 */

export interface PartnershipUserImageReadModel {
  id: string;
  urls?: {
    original?: string | null;
    medium?: string | null;
    thumbnail?: string | null;
  };
}

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
  status?: string;
  deleted?: boolean;
  updatedAt?: string | Date;
  [key: string]: unknown;
}
