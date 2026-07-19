export interface ICascadeDeleter {
  deleteEvents(eventIds: string[]): Promise<void>;
  deletePlace(placeId: string): Promise<void>;
  deleteImagesWithComments(imageIds: string[]): Promise<void>;
}
