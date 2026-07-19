import { ValidationError } from "@src/shared/errors";

export interface PlaceLocationProps {
  type: "Point";
  coordinates: [number, number];
  label: string;
  id: string;
}

export type PlaceLocation = PlaceLocationProps;

export const PlaceLocation = {
  from(value: PlaceLocationProps): PlaceLocation {
    if (value.type !== "Point") {
      throw new ValidationError(
        { location: "Location type must be Point" },
        undefined,
        "Location type must be Point"
      );
    }
    if (
      !Array.isArray(value.coordinates) ||
      value.coordinates.length !== 2 ||
      typeof value.coordinates[0] !== "number" ||
      typeof value.coordinates[1] !== "number"
    ) {
      throw new ValidationError(
        { location: "Location coordinates must be [lng, lat]" },
        undefined,
        "Location coordinates must be [lng, lat]"
      );
    }
    if (!value.label?.trim()) {
      throw new ValidationError(
        { location: "Location label is required" },
        undefined,
        "Location label is required"
      );
    }
    if (!value.id?.trim()) {
      throw new ValidationError(
        { location: "Location id is required" },
        undefined,
        "Location id is required"
      );
    }
    return {
      type: "Point",
      coordinates: [value.coordinates[0], value.coordinates[1]],
      label: value.label,
      id: value.id,
    };
  },
};
