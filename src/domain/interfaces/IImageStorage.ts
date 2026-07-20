import { ImageUrls } from "@src/domain/value-objects/ImageUrls.vo";

export interface UploadImageFileParams {
  buffer: Buffer;
  mimetype: string;
  originalName: string;
}

export interface IImageStorage {
  upload(params: UploadImageFileParams): Promise<ImageUrls>;
  signUrl(url: string): Promise<string>;
  signUrls(urls: ImageUrls): Promise<ImageUrls>;
  deleteUrls(urls: ImageUrls): Promise<void>;
}
