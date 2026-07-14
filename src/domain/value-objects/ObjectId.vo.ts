import { isValidObjectId } from "mongoose";

const assertObjectId = (value: string, label: string): string => {
  if (!value || !isValidObjectId(value)) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
  return value;
};

export type FavoriteId = string & { readonly __brand: "FavoriteId" };
export type UserId = string & { readonly __brand: "UserId" };
export type ReferenceId = string & { readonly __brand: "ReferenceId" };

export const FavoriteId = {
  from(value: string): FavoriteId {
    return assertObjectId(value, "favorite id") as FavoriteId;
  },
  create(value: string): FavoriteId {
    return FavoriteId.from(value);
  },
};

export const UserId = {
  from(value: string): UserId {
    return assertObjectId(value, "user id") as UserId;
  },
};

export const ReferenceId = {
  from(value: string): ReferenceId {
    return assertObjectId(value, "reference id") as ReferenceId;
  },
};
