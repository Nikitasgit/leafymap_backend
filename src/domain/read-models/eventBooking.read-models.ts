/**
 * Typed read models for EventBooking query paths.
 * Produced by infrastructure Read Mappers (never raw Mongo docs).
 */

export interface EventBookingImageReadModel {
  id: string;
  urls?: {
    original?: string | null;
    medium?: string | null;
    thumbnail?: string | null;
  };
}

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
  location?: unknown;
}

export interface EventBookingEventReadModel {
  id: string;
  name?: string;
  image?: EventBookingImageReadModel | string | null;
  place?: EventBookingPlaceReadModel | string | null;
  user?: EventBookingUserReadModel | string;
  eventCategory?: EventBookingCategoryReadModel | string;
  [key: string]: unknown;
}

/** List view returned by findConfirmedByEvent and findConfirmedByUser. */
export interface EventBookingListItemReadModel {
  id: string;
  event?: EventBookingEventReadModel | string;
  user?: EventBookingUserReadModel | string;
  seats?: number;
  status?: string;
  cancelledAt?: string | Date | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  [key: string]: unknown;
}

/** Shape returned when the current user asks for their booking on one event. */
export interface MyEventBookingReadModel {
  id: string;
  event: string;
  user: string;
  seats: number;
  status: string;
  cancelledAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}
