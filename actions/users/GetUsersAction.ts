import {
  IUserRepository,
  UserFilters,
} from "../../repositories/users/IUserRepository";
import { IUser } from "../../types/models/user";

export interface GetUsersInput {
  creatorName?: string;
  limit?: number;
  excludeIds?: string[];
}

export interface IGetUsersAction {
  execute(params: { filters?: GetUsersInput }): Promise<IUser[]>;
}

class GetUsersAction implements IGetUsersAction {
  private readonly project: (keyof IUser | string)[] = [
    "_id",
    "firstname",
    "lastname",
    "username",
    "creatorName",
    "rating",
    "image.urls",
    "userCategories.name",
  ];

  constructor(private userRepository: IUserRepository) {}

  async execute({ filters }: { filters?: GetUsersInput }): Promise<IUser[]> {
    const queryFilters: UserFilters = {
      deleted: false,
    };

    if (filters?.creatorName) {
      queryFilters.creatorName = {
        $regex: filters.creatorName,
        $options: "i",
      };
    }

    if (filters?.excludeIds) {
      const excludeArray = Array.isArray(filters.excludeIds)
        ? filters.excludeIds
        : [filters.excludeIds];
      queryFilters._id = { $nin: excludeArray };
    }

    const users = await this.userRepository.findAll({
      filters: queryFilters,
      project: this.project,
      limit: filters?.limit || 10,
    });

    return users as IUser[];
  }
}

export default GetUsersAction;
