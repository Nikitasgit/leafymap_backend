import { ImageListItemReadModel } from "@src/domain/read-models/image.read-models";

export interface GetImagesInput {
  reference: string;
  referenceType: string;
  type?: string;
  userId?: string;
}

export interface GetImagesOutput {
  images: ImageListItemReadModel[];
}
