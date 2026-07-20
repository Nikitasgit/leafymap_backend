export interface GetImagesInput {
  reference: string;
  referenceType: string;
  type?: string;
  userId?: string;
}

export interface ImageListItemOutput {
  id: string;
  urls: {
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

export interface GetImagesOutput {
  images: ImageListItemOutput[];
}
