import { CollaboratorDTO } from "./collaborator.dto";
import { Location } from "./common.dto";
import { PlaceDTO } from "./place.dto";
import { UserDTO } from "./user.dto";

export interface EventPeriodDTO {
  startDate: string;
  endDate: string;
  timeSlots: EventTimeSlotDTO[];
}

export interface EventTimeSlotDTO {
  title: string;
  startTime: string;
  endTime: string;
  collaborators: CollaboratorDTO[];
}

export interface EventDTO {
  name: string;
  description: string;
  eventCategory: string;
  schedule: EventPeriodDTO[];
  user: string | Partial<UserDTO>;
  place?: string | Partial<PlaceDTO> | null;
  location?: Location | null;
  online: boolean;
  image?: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
}
