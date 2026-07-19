import { ERROR_CODES, ValidationError } from "@src/shared/errors";

export const IMAGE_TYPES = ["profile", "cover", "gallery", "other"] as const;

export type ImageType = (typeof IMAGE_TYPES)[number];

export const SINGLE_IMAGE_TYPES: ImageType[] = ["profile", "cover"];

export const ImageType = {
  from(value: string): ImageType {
    if (!IMAGE_TYPES.includes(value as ImageType)) {
      const message = `Invalid image type: ${value}`;
      throw new ValidationError(
        { value: message },
        ERROR_CODES.VALIDATION_ERROR,
        message
      );
    }
    return value as ImageType;
  },
};
