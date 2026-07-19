import { isValidObjectId as mongooseIsValidObjectId } from "mongoose";

export const isValidObjectId = (value: string): boolean =>
  Boolean(value) && mongooseIsValidObjectId(value);
