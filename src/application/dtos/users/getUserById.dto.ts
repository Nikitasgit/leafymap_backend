import { UserDetailsView } from "@src/domain/interfaces/IUserRepository";

export interface GetUserByIdInput {
  userId: string;
  view?: UserDetailsView;
}
