/**
 * Typed read models for EventInvitation query paths.
 * Produced by infrastructure Read Mappers (never raw Mongo docs).
 */

export interface EventInvitationImageReadModel {
  id: string;
  urls?: {
    original?: string | null;
    medium?: string | null;
    thumbnail?: string | null;
  };
}

export interface EventInvitationUserCategoryReadModel {
  id: string;
  name?: string;
}

export interface EventInvitationUserReadModel {
  id: string;
  username?: string;
  image?: EventInvitationImageReadModel | string | null;
  userCategory?: EventInvitationUserCategoryReadModel | string;
  googlePictureUrl?: string | null;
  deleted?: boolean;
}

export interface EventInvitationEventReadModel {
  id: string;
  name?: string;
  description?: string;
  image?: EventInvitationImageReadModel | string | null;
  schedule?: unknown;
  status?: string;
  lifecycleStatus?: string;
  dateRange?: unknown;
}

/** List view returned by findListByEvent and findListForUser. */
export interface EventInvitationListItemReadModel {
  id: string;
  initiator?: EventInvitationUserReadModel | string;
  collaborator?: EventInvitationUserReadModel | string;
  event?: EventInvitationEventReadModel | string;
  status?: string;
  deleted?: boolean;
  updatedAt?: string | Date;
  [key: string]: unknown;
}
