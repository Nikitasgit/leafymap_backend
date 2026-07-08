import { IUser } from "@/types/models/user";
import { IUserRepository } from "@/types/repositories/user.repository.types";

export interface ISearchAdminUsersAction {
  execute(params: { email?: string }): Promise<Partial<IUser>[]>;
}

class SearchAdminUsersAction implements ISearchAdminUsersAction {
  private readonly project: (keyof IUser | string)[] = [
    "_id",
    "email",
    "username",
    "firstname",
    "lastname",
    "userType",
    "role",
    "deleted",
    "bannedAt",
    "banReason",
    "banExpiresAt",
    "lastLogin",
    "createdAt",
  ];

  constructor(private userRepository: IUserRepository) {}

  async execute({ email }: { email?: string }): Promise<Partial<IUser>[]> {
    const search = email?.trim();
    if (!search) return [];

    return this.userRepository.findAll({
      filters: { email: { $regex: search, $options: "i" } },
      project: this.project,
      limit: 20,
      sort: { createdAt: -1 },
    });
  }
}

export default SearchAdminUsersAction;
