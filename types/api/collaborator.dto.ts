export interface CollaboratorDTO {
  _id: string;
  status?: "pending" | "accepted" | "refused";
}
