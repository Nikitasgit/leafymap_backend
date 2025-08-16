import { PlaceDTO } from "./place.dto";
import { UserDTO } from "./user.dto";

export interface PartnershipDTO {
  _id: string;
  place?: string | Partial<PlaceDTO>;
  collaborator: Partial<UserDTO>;
  status?: "pending" | "accepted" | "refused";
  type?: "place" | "event";
  deleted?: boolean;
}
