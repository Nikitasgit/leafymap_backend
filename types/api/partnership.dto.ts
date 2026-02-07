import { UserDTO } from "./user.dto";

export interface PartnershipDTO {
  _id?: string;
  collaborator: Partial<UserDTO>;
  status?: "pending" | "accepted" | "refused";
  deleted?: boolean;
}
