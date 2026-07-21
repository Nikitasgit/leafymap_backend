import { SearchAdminUsersInput } from "@src/application/dtos/admin/searchAdminUsers.dto";
import { UserDetailsReadModel } from "@src/domain/read-models/user.read-models";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";

class SearchAdminUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(
    params: SearchAdminUsersInput
  ): Promise<UserDetailsReadModel[]> {
    const search = params.email?.trim();
    if (!search) {
      return [];
    }

    return this.userRepository.findAdminByEmail(search, 20);
  }
}

export default SearchAdminUsersUseCase;
