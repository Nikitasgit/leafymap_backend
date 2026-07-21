import {
  ImageReferenceReadModel,
  LocationReadModel,
  ReadModelDate,
} from "@src/domain/read-models/shared.read-models";

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
  image?: ImageReferenceReadModel | string | null;
  userCategory?: PlaceUserCategoryReadModel | string;
}

export interface PlaceTimeSlotReadModel {
  startTime: string;
  endTime: string;
}

export interface PlaceScheduleEventReadModel {
  id: string;
  name: string;
  image?: ImageReferenceReadModel | null;
}

export interface PlaceDayScheduleReadModel {
  open: boolean;
  timeSlots: PlaceTimeSlotReadModel[];
  events?: PlaceScheduleEventReadModel[];
}

export interface PlaceDefaultScheduleReadModel {
  monday: PlaceDayScheduleReadModel;
  tuesday: PlaceDayScheduleReadModel;
  wednesday: PlaceDayScheduleReadModel;
  thursday: PlaceDayScheduleReadModel;
  friday: PlaceDayScheduleReadModel;
  saturday: PlaceDayScheduleReadModel;
  sunday: PlaceDayScheduleReadModel;
}

export interface PlaceCustomDateReadModel {
  date?: string | Date;
  open?: boolean;
  timeSlots?: PlaceTimeSlotReadModel[];
}

/** Shared fields for list and in-view place reads. */
export interface PlaceListItemReadModel {
  id: string;
  location?: LocationReadModel;
  rating?: number;
  placeCategory?: PlaceCategoryReadModel | string;
  user?: PlaceUserReadModel | string;
  defaultSchedule?: PlaceDefaultScheduleReadModel;
  customDates?: PlaceCustomDateReadModel[];
  deleted?: boolean;
  createdAt?: ReadModelDate;
  updatedAt?: ReadModelDate;
}

/** Detail view: list fields plus schedule and soft-delete metadata. */
export type PlaceDetailsReadModel = PlaceListItemReadModel;
