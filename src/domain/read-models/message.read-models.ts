import {
  ImageReferenceReadModel,
  LocationReadModel,
  ReadModelDate,
} from "@src/domain/read-models/shared.read-models";
import {
  EventDateRangeReadModel,
  EventImageReadModel,
} from "@src/domain/read-models/event.read-models";
import { LifecycleStatus } from "@src/domain/value-objects/LifecycleStatus.vo";

export interface MessageSenderReadModel {
  id: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  image?: ImageReferenceReadModel | string | null;
}

export interface MessagePartnershipEventReadModel {
  id: string;
  name?: string;
  description?: string;
  lifecycleStatus?: LifecycleStatus;
  image?: EventImageReadModel | string | null;
  dateRange?: EventDateRangeReadModel;
}

export interface MessagePartnershipPlaceReadModel {
  id: string;
  location?: LocationReadModel;
  placeCategory?: { id: string; name?: string } | string;
  followers?: number;
}

export interface MessagePartnershipReadModel {
  id: string;
  type?: "place" | "event";
  event?: MessagePartnershipEventReadModel | string;
  place?: MessagePartnershipPlaceReadModel | string;
}

export interface MessageListItemReadModel {
  id: string;
  conversation: string;
  sender?: MessageSenderReadModel | string;
  content?: string;
  readBy: string[];
  partnership?: MessagePartnershipReadModel | string;
  createdAt: ReadModelDate;
  updatedAt: ReadModelDate;
}
