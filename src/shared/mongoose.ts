import { Types } from "mongoose";

type IdLike =
  | Types.ObjectId
  | string
  | { _id?: Types.ObjectId | string }
  | { toString(): string }
  | null
  | undefined;

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
