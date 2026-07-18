import { EventLocation } from "@src/domain/entities/Event.entity";
import { EventPeriod } from "@src/domain/value-objects/EventSchedule.vo";
import { EventStatus } from "@src/domain/value-objects/EventStatus.vo";

export interface CreateEventInput {
  name: string;
  description: string;
  ownerId: string;
  categoryId: string;
  schedule: EventPeriod[];
  placeId?: string | null;
  location?: EventLocation | null;
  online?: boolean;
  imageId?: string;
  status?: EventStatus;
  isBookable?: boolean;
  capacity?: number | null;
  maxSeatsPerBooking?: number;
}
