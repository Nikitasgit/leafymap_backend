import {
  ImageReferenceReadModel,
  ReadModelDate,
} from "@src/domain/read-models/shared.read-models";
import {
  EventDateRangeReadModel,
  EventPeriodReadModel,
} from "@src/domain/read-models/event.read-models";
import { EventInvitationStatus } from "@src/domain/value-objects/EventInvitationStatus.vo";
import { EventStatus } from "@src/domain/value-objects/EventStatus.vo";
import { LifecycleStatus } from "@src/domain/value-objects/LifecycleStatus.vo";

export type EventInvitationImageReadModel = ImageReferenceReadModel;

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
  schedule?: EventPeriodReadModel[];
  status?: EventStatus;
  lifecycleStatus?: LifecycleStatus;
  dateRange?: EventDateRangeReadModel;
}

/** List view returned by findListByEvent and findListForUser. */
export interface EventInvitationListItemReadModel {
  id: string;
  initiator?: EventInvitationUserReadModel | string;
  collaborator?: EventInvitationUserReadModel | string;
  event?: EventInvitationEventReadModel | string;
  status?: EventInvitationStatus;
  deleted?: boolean;
  updatedAt?: ReadModelDate;
}
