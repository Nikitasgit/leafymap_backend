import { BaseEntity, ContactInfo, Location } from "./common.dto";
import { CollaboratorDTO } from "./collaborator.dto";
import { UserDTO } from "./user.dto";

export interface TimeSlotDTO {
  startTime: string;
  endTime: string;
}

export type PlaceTypeDTO = "food" | "art" | "craft";

export interface DayScheduleDTO {
  open: boolean;
  timeSlots: TimeSlotDTO[];
}

export interface DefaultScheduleDTO {
  monday: DayScheduleDTO;
  tuesday: DayScheduleDTO;
  wednesday: DayScheduleDTO;
  thursday: DayScheduleDTO;
  friday: DayScheduleDTO;
  saturday: DayScheduleDTO;
  sunday: DayScheduleDTO;
}

export interface CustomDateDTO {
  date: string; // ISO date string
  open: boolean;
  timeSlots: TimeSlotDTO[];
}

export interface PlaceDTO extends BaseEntity, ContactInfo {
  name: string;
  description?: string;
  user: string | Partial<UserDTO>;
  location: Location;
  image?: string;
  images?: string[];
  active: boolean;
  isCreatorPlace: boolean;
  rating: number;
  placeCategory: string | Partial<PlaceCategoryDTO>;
  placeType: PlaceTypeDTO[];
  defaultSchedule: DefaultScheduleDTO;
  customDates: CustomDateDTO[];
  collaborators: CollaboratorDTO[];
}

export interface PlaceCategoryDTO {
  _id: string;
  name: string;
  description?: string;
  placeType: PlaceTypeDTO[];
}
