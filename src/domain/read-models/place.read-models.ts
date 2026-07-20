/**
 * Typed read models for Place query paths.
 * Produced by infrastructure Read Mappers (never raw Mongo docs).
 */

export interface PlaceCategoryReadModel {
  id: string;
  name?: string;
}

export interface PlaceUserCategoryTypeReadModel {
  id: string;
  name?: string;
}

export interface PlaceUserCategoryReadModel {
  id: string;
  name?: string;
  type?: PlaceUserCategoryTypeReadModel | string;
}

export interface PlaceUserReadModel {
  id: string;
  username?: string;
  description?: string;
  website?: string;
  firstname?: string;
  lastname?: string;
  image?: { urls?: { thumbnail?: string | null } } | string | null;
  userCategory?: PlaceUserCategoryReadModel | string;
}

export interface PlaceTimeSlotReadModel {
  startTime?: string;
  endTime?: string;
}

export interface PlaceDayScheduleReadModel {
  open?: boolean;
  timeSlots?: PlaceTimeSlotReadModel[];
}

export interface PlaceDefaultScheduleReadModel {
  monday?: PlaceDayScheduleReadModel;
  tuesday?: PlaceDayScheduleReadModel;
  wednesday?: PlaceDayScheduleReadModel;
  thursday?: PlaceDayScheduleReadModel;
  friday?: PlaceDayScheduleReadModel;
  saturday?: PlaceDayScheduleReadModel;
  sunday?: PlaceDayScheduleReadModel;
}

export interface PlaceCustomDateReadModel {
  date?: string | Date;
  open?: boolean;
  timeSlots?: PlaceTimeSlotReadModel[];
}

/** Shared fields for list and in-view place reads. */
export interface PlaceListItemReadModel {
  id: string;
  location?: unknown;
  rating?: number;
  placeCategory?: PlaceCategoryReadModel | string;
  user?: PlaceUserReadModel | string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  [key: string]: unknown;
}

/** Detail view: list fields plus schedule and soft-delete metadata. */
export interface PlaceDetailsReadModel extends PlaceListItemReadModel {
  defaultSchedule?: PlaceDefaultScheduleReadModel;
  customDates?: PlaceCustomDateReadModel[];
  deleted?: boolean;
}
