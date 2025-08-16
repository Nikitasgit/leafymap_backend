import { BaseEntity } from "./common.dto";
import { PlaceDTO } from "./place.dto";

export interface UserDTO extends BaseEntity {
  phone?: string;
  website?: string;
  email: string;
  firstname?: string;
  lastname?: string;
  username: string;
  userType: "creator" | "organizer" | "guest";
  location?: {
    number?: string;
    street: string;
    code: string;
    extra?: string;
  };
  description?: string;
  country?: string;
  image?: string;
  followers: string[] | Partial<UserDTO>[];
  creatorProfile?: {
    categories: string[];
    place?: string | Partial<PlaceDTO>;
    name: string;
  };
  interests: string[];
  places: string[] | Partial<PlaceDTO>[];
  deleted: boolean;
}
