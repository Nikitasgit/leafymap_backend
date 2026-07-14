export interface CreateFavoriteInput {
  userId: string;
  referenceId: string;
  referenceType: string;
}

export interface CreateFavoriteOutput {
  id: string;
}
