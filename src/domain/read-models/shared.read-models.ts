export type ReadModelDate = Date | string;

export interface ImageUrlsReadModel {
  original?: string | null;
  thumbnail?: string | null;
  medium?: string | null;
  small?: string | null;
  large?: string | null;
}

export interface ImageReferenceReadModel {
  id: string;
  urls?: ImageUrlsReadModel;
}

export interface LocationReadModel {
  type: "Point";
  coordinates: [number, number];
  label: string;
  id: string;
}
