export interface GetFavoritesByTypeInput {
  userId: string;
  referenceType: string;
}

export interface GetFavoritesByTypeOutput {
  referenceIds: string[];
}
