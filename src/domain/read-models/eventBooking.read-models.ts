import {
  ImageReferenceReadModel,
  LocationReadModel,
  ReadModelDate,
} from "@src/domain/read-models/shared.read-models";
import { EventBookingStatus } from "@src/domain/value-objects/EventBookingStatus.vo";

export type EventBookingImageReadModel = ImageReferenceReadModel;

export interface EventBookingUserReadModel {
  id: string;
  username?: string;
  email?: string;
  image?: EventBookingImageReadModel | string | null;
}

export interface EventBookingCategoryReadModel {
  id: string;
  name?: string;
}

export interface EventBookingPlaceReadModel {
  id: string;
  location?: LocationReadModel;
}

export interface EventBookingEventReadModel {
  id: string;
  name?: string;
  image?: EventBookingImageReadModel | string | null;
  place?: EventBookingPlaceReadModel | string | null;
  user?: EventBookingUserReadModel | string;
  eventCategory?: EventBookingCategoryReadModel | string;
}

/** List view returned by findConfirmedByEvent and findConfirmedByUser. */
export interface EventBookingListItemReadModel {
  id: string;
  event?: EventBookingEventReadModel | string;
  user?: EventBookingUserReadModel | string;
  seats?: number;
  status?: EventBookingStatus;
  cancelledAt?: ReadModelDate | null;
  createdAt?: ReadModelDate;
  updatedAt?: ReadModelDate;
}

/** Shape returned when the current user asks for their booking on one event. */
export interface MyEventBookingReadModel {
  id: string;
  event: string;
  user: string;
  seats: number;
  status: EventBookingStatus;
  cancelledAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}
