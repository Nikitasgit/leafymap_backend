import {
  ImageReferenceReadModel,
  LocationReadModel,
  ReadModelDate,
} from "@src/domain/read-models/shared.read-models";
import { EventStatus } from "@src/domain/value-objects/EventStatus.vo";
import { LifecycleStatus } from "@src/domain/value-objects/LifecycleStatus.vo";

export type EventImageReadModel = ImageReferenceReadModel;

export interface EventUserReadModel {
  id: string;
  username?: string;
  image?: EventImageReadModel | string | null;
}

export interface EventPlaceReadModel {
  id: string;
  location?: LocationReadModel;
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
  title: string;
  startTime: string;
  endTime: string;
  collaborators: Array<EventCollaboratorReadModel | string>;
}

export interface EventPeriodReadModel {
  id?: string;
  startDate: ReadModelDate;
  endDate: ReadModelDate;
  timeSlots?: EventTimeSlotReadModel[];
}

export interface EventDateRangeReadModel {
  firstDate?: ReadModelDate;
  latestDate?: ReadModelDate;
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
  location?: LocationReadModel | null;
  online?: boolean;
  status?: EventStatus;
  lifecycleStatus?: LifecycleStatus;
  schedule?: EventPeriodReadModel[];
  dateRange?: EventDateRangeReadModel;
  isBookable?: boolean;
  capacity?: number | null;
  maxSeatsPerBooking?: number;
}

/** Detail view: list fields plus rating, timestamps, booking aggregates. */
export interface EventDetailsReadModel extends EventListItemReadModel {
  rating?: number;
  createdAt?: ReadModelDate;
  updatedAt?: ReadModelDate;
  deleted?: boolean;
  bookedSeats?: number;
  remainingSeats?: number | null;
}

export interface EventScheduleSummaryReadModel {
  id: string;
  name: string;
  schedule: EventPeriodReadModel[];
  image?: EventImageReadModel | string | null;
  status?: EventStatus;
  deleted?: boolean;
}

export interface AdminEventSummaryReadModel {
  id: string;
  name: string;
  status: EventStatus;
  lifecycleStatus: LifecycleStatus;
  deleted: boolean;
  createdAt: Date;
}
