import { signNestedImageUrls } from "@src/application/services/signNestedImageUrls";
import type { IImageStorage } from "@src/domain/interfaces/IImageStorage";

let imageStorage: IImageStorage | null = null;

export const configureImageUrlSigning = (storage: IImageStorage): void => {
  imageStorage = storage;
};

export const signResponseImageUrls = async <T>(payload: T): Promise<T> => {
  if (!imageStorage || payload == null) {
    return payload;
  }
  return signNestedImageUrls(imageStorage, payload);
};
