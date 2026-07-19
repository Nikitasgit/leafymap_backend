import { UserType } from "@src/domain/entities/User.entity";

export interface GetUsersInput {
  username?: string;
  userType?: UserType;
  limit?: number;
  excludeIds?: string[];
}
