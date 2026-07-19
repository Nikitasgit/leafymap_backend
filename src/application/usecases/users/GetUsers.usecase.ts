import { GetUsersInput } from "@src/application/dtos/users/getUsers.dto";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";

class GetUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(params: {
    filters?: GetUsersInput;
  }): Promise<Record<string, unknown>[]> {
    return this.userRepository.findList({
      username: params.filters?.username,
      userType: params.filters?.userType,
      excludeIds: params.filters?.excludeIds,
      limit: params.filters?.limit ?? 10,
    });
  }
}

export default GetUsersUseCase;
