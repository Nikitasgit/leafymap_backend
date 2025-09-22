import { BaseEntity, ContactInfo, Location } from "./common.dto";

// API Place types - for frontend consumption
export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export type ApiPlaceType = "food" | "art" | "craft";

export interface DaySchedule {
  open: boolean;
  timeSlots: TimeSlot[];
}

export interface DefaultSchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface CustomSchedule {
  date: string; // ISO date string
  open: boolean;
  timeSlots: TimeSlot[];
}

export interface Place extends BaseEntity, ContactInfo {
  name: string;
  description?: string;
  userId: string;
  location: Location;
  image?: string;
  images?: string[];
  active: boolean;
  isCreatorPlace: boolean;
  rating: number;
  placeCategory: string;
  placeType: ApiPlaceType[];
  defaultSchedule: DefaultSchedule;
  customSchedule: CustomSchedule[];
  followers: string[];
}

export interface PlaceWithDetails
  extends Omit<
    Place,
    "userId" | "placeCategory" | "collaborators" | "createdCollaborators"
  > {
  // Extended place with populated references
  userId: User;
  placeCategory: PlaceCategory;
}

// Import types that will be defined in other files
interface User {
  _id: string;
  username: string;
  image?: string;
}

interface PlaceCategory {
  _id: string;
  name: string;
  description: string;
  types: ApiPlaceType[];
}
