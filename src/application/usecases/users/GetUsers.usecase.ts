import { GetUsersInput } from "@src/application/dtos/users/getUsers.dto";
import { UserListItemReadModel } from "@src/domain/read-models/user.read-models";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";

class GetUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(params: {
    filters?: GetUsersInput;
  }): Promise<UserListItemReadModel[]> {
    return this.userRepository.findList({
      username: params.filters?.username,
      userType: params.filters?.userType,
      excludeIds: params.filters?.excludeIds,
      limit: params.filters?.limit ?? 10,
    });
  }
}

export default GetUsersUseCase;
