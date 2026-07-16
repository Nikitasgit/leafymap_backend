import { isValidObjectId as mongooseIsValidObjectId } from "mongoose";

export const isValidObjectId = (value: string): boolean =>
  Boolean(value) && mongooseIsValidObjectId(value);

export const assertObjectId = (value: string, label = "id"): string => {
  if (!isValidObjectId(value)) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
  return value;
};
