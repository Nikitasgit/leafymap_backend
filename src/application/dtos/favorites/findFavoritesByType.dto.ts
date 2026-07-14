export interface FindFavoritesByTypeInput {
  userId: string;
  referenceType: string;
}

export interface FindFavoritesByTypeOutput {
  referenceIds: string[];
}
