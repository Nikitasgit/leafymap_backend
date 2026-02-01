import { UserDTO } from "./user.dto";

export interface EventInvitationDTO {
  _id: string;
  collaborator: Partial<UserDTO>;
  status?: "pending" | "accepted" | "refused" | "cancelled" | "completed";
  deleted?: boolean;
}
