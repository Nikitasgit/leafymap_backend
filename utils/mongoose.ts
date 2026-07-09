import { Types } from "mongoose";
import { IEvent, IPlace } from "@/types/models";

type IdLike =
  | Types.ObjectId
  | string
  | { _id?: Types.ObjectId | string }
  | { toString(): string }
  | null
  | undefined;

type EventOwnerSource = {
  user?: IdLike;
  place?: IdLike | Pick<IPlace, "user"> | Partial<IPlace> | IEvent["place"];
};

export function toId(value: IdLike): string | null {
  if (value == null) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Types.ObjectId) {
    return value.toString();
  }

  if (typeof value === "object" && "_id" in value && value._id != null) {
    return toId(value._id as IdLike);
  }

  if (typeof value === "object" && "toString" in value) {
    return (value as { toString(): string }).toString();
  }

  return null;
}

export function resolveOwnerId(event: EventOwnerSource): string | null {
  const directOwner = toId(event.user ?? null);
  if (directOwner) {
    return directOwner;
  }

  if (event.place == null) {
    return null;
  }

  if (typeof event.place === "object" && event.place !== null && "user" in event.place) {
    return toId((event.place as Pick<IPlace, "user">).user ?? null);
  }

  return null;
}

export function isEventOwner(
  event: EventOwnerSource,
  userId: string
): boolean {
  const ownerId = resolveOwnerId(event);
  return ownerId === userId;
}
