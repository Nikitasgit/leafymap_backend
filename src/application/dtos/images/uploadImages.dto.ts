export interface UploadImageFileInput {
  buffer: Buffer;
  mimetype: string;
  originalName: string;
  size: number;
}

export interface UploadImagesInput {
  userId: string;
  reference: string;
  referenceType: string;
  type: string;
  files: UploadImageFileInput[];
}

export interface UploadedImageOutput {
  _id: string;
  urls: {
    original: string;
    thumbnail: string;
    medium: string;
  };
  signedUrls: {
    original: string;
    thumbnail: string;
    medium: string;
  };
  user: string;
  reference: string;
  referenceType: string;
  type: string;
  originalName: string;
  size: number;
  mimetype: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadImagesOutput {
  images: UploadedImageOutput[];
  count: number;
}
