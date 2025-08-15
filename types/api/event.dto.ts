import { CollaboratorDTO } from "./collaborator.dto";
import { PlaceDTO } from "./place.dto";

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
  schedule: EventPeriodDTO[];
  place: string | Partial<PlaceDTO>;
  image?: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
}
