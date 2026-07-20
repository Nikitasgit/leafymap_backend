/**
 * Typed read models for Event query paths.
 * Produced by infrastructure Read Mappers (never raw Mongo docs).
 */

export interface EventImageUrlsReadModel {
  original?: string | null;
  medium?: string | null;
  thumbnail?: string | null;
}

export interface EventImageReadModel {
  id: string;
  urls?: EventImageUrlsReadModel;
}

export interface EventUserReadModel {
  id: string;
  username?: string;
  image?: EventImageReadModel | string | null;
}

export interface EventPlaceReadModel {
  id: string;
  location?: unknown;
  user?: EventUserReadModel | string;
}

export interface EventCategoryReadModel {
  id: string;
  name?: string;
}

export interface EventCollaboratorReadModel {
  id: string;
  name?: string;
  image?: string | null;
}

export interface EventTimeSlotReadModel {
  id?: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  collaborators?: Array<EventCollaboratorReadModel | string>;
}

export interface EventPeriodReadModel {
  id?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  timeSlots?: EventTimeSlotReadModel[];
}

export interface EventDateRangeReadModel {
  firstDate?: string | Date;
  latestDate?: string | Date;
}

/** Shared fields for list and detail event reads. */
export interface EventListItemReadModel {
  id: string;
  name?: string;
  description?: string;
  image?: EventImageReadModel | string | null;
  eventCategory?: EventCategoryReadModel | string;
  place?: EventPlaceReadModel | string | null;
  user?: EventUserReadModel | string;
  location?: unknown;
  online?: boolean;
  status?: string;
  lifecycleStatus?: string;
  schedule?: EventPeriodReadModel[];
  dateRange?: EventDateRangeReadModel;
  isBookable?: boolean;
  capacity?: number | null;
  maxSeatsPerBooking?: number;
  [key: string]: unknown;
}

/** Detail view: list fields plus rating, timestamps, booking aggregates. */
export interface EventDetailsReadModel extends EventListItemReadModel {
  rating?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  deleted?: boolean;
  bookedSeats?: number;
  remainingSeats?: number | null;
}
