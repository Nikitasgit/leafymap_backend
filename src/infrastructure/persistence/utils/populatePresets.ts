import { PopulateOptions } from "mongoose";

export const imageUrlsPopulate: PopulateOptions = {
  path: "image",
  select: "urls",
};

export function userWithImagePopulate(
  path: string,
  select: string
): PopulateOptions {
  return {
    path,
    select,
    populate: imageUrlsPopulate,
  };
}
