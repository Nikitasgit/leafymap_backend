import { PlaceLocation } from "@src/domain/value-objects/PlaceLocation.vo";
import {
  PlaceCustomDate,
  PlaceDefaultSchedule,
} from "@src/domain/value-objects/PlaceSchedule.vo";

export interface UpdatePlaceInput {
  placeId: string;
  userId: string;
  location?: PlaceLocation;
  placeCategoryId?: string;
  defaultSchedule?: PlaceDefaultSchedule;
  customDates?: PlaceCustomDate[];
}
