import { Types } from "mongoose";
import { IUser } from "@/types/models/user";
import { IEvent, IEventPeriod } from "@/types/models/event";
import { IPartnership } from "@/types/models/partnership";

type CreateEventDTO = {
  name: string;
  description: string;
  eventCategory: string;
  schedule: IEventPeriod[];
  user: string;
  place?: string | null;
  location?: unknown;
  online?: boolean;
  image?: string;
  status?: "cancelled" | "full" | "available";
  isBookable?: boolean;
  capacity?: number | null;
  maxSeatsPerBooking?: number;
};

const defaultEventSchedule: IEventPeriod[] = [
  {
    startDate: new Date("2026-07-01T10:00:00.000Z"),
    endDate: new Date("2026-07-01T18:00:00.000Z"),
    timeSlots: [],
  },
];

const defaultEventContent = {
  name: "Marché local",
  description: "Un événement de quartier pour découvrir les créateurs locaux.",
  eventCategory: new Types.ObjectId(),
  schedule: defaultEventSchedule,
};

/**
 * Returns a repository mock covering the methods shared by all repositories,
 * plus any extra methods passed in `extraMethods` (e.g. "sumConfirmedSeats",
 * "incrementFollowers", "aggregate").
 *
 * Cast the result to the repository interface you need:
 *
 *   const eventRepository =
 *     createMockRepository<IEventRepository>("aggregate", "updateMany");
 */
export const createMockRepository = <T>(...extraMethods: string[]): jest.Mocked<T> => {
  const base: Record<string, jest.Mock> = {
    create: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
  };
  for (const method of extraMethods) {
    base[method] = jest.fn();
  }
  return base as jest.Mocked<T>;
};

/** New ObjectId as string, handy for ids passed to actions. */
export const mockObjectId = (): string => new Types.ObjectId().toString();

/**
 * Minimal user for action tests. Override any field via `overrides`.
 * Only includes fields commonly read by actions; add what your test needs.
 */
export const buildUser = (overrides: Partial<IUser> = {}): Partial<IUser> => ({
  _id: new Types.ObjectId(),
  email: "user@test.com",
  username: "user",
  password: "hashed-password",
  userType: "guest",
  role: "user",
  deleted: false,
  emailVerified: true,
  acceptedCGU: true,
  acceptedAt: new Date(),
  ...overrides,
});

/**
 * Minimal event for action/repository tests. Override any field via `overrides`.
 * Includes both booking fields (for findById mocks) and content fields (name,
 * schedule…) shared across create/validation tests.
 */
export const buildEvent = (overrides: Partial<IEvent> = {}): Partial<IEvent> => ({
  _id: new Types.ObjectId(),
  ...defaultEventContent,
  user: new Types.ObjectId(),
  deleted: false,
  online: false,
  isBookable: true,
  capacity: 10,
  maxSeatsPerBooking: 4,
  lifecycleStatus: "upcoming",
  status: "available",
  ...overrides,
});

/** Payload for CreateEventAction tests (string ids, Date schedule). */
export const buildCreateEventData = (
  overrides: Partial<CreateEventDTO> = {}
): CreateEventDTO => {
  const event = buildEvent();
  return {
    name: event.name!,
    description: event.description!,
    eventCategory: (event.eventCategory as Types.ObjectId).toString(),
    schedule: event.schedule!,
    user: (event.user as Types.ObjectId).toString(),
    online: event.online,
    ...overrides,
  };
};

/** Payload for newEventSchema validation tests (ISO string dates). */
export const buildEventValidationPayload = (
  overrides: Record<string, unknown> = {}
) => {
  const event = buildEvent();
  return {
    name: event.name,
    description: event.description,
    eventCategory: (event.eventCategory as Types.ObjectId).toString(),
    schedule: event.schedule!.map((period) => ({
      startDate: period.startDate.toISOString(),
      endDate: period.endDate.toISOString(),
      timeSlots: period.timeSlots ?? [],
    })),
    online: event.online,
    ...overrides,
  };
};

/** Minimal partnership for action tests. */
export const buildPartnership = (
  overrides: Partial<IPartnership> = {}
): Partial<IPartnership> => ({
  _id: new Types.ObjectId(),
  initiator: new Types.ObjectId(),
  collaborator: new Types.ObjectId(),
  status: "pending",
  deleted: false,
  ...overrides,
});
