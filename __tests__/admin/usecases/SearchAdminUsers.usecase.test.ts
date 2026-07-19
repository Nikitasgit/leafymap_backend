import SearchAdminUsersUseCase from "@src/application/usecases/admin/SearchAdminUsers.usecase";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { createMockUserRepository } from "../../helpers/mockUserRepository";

describe("SearchAdminUsersUseCase", () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let useCase: SearchAdminUsersUseCase;

  beforeEach(() => {
    userRepository = createMockUserRepository();
    useCase = new SearchAdminUsersUseCase(userRepository);
  });

  it("returns empty list when email is missing or blank", async () => {
    await expect(useCase.execute({})).resolves.toEqual([]);
    await expect(useCase.execute({ email: "   " })).resolves.toEqual([]);
    expect(userRepository.findAdminByEmail).not.toHaveBeenCalled();
  });

  it("searches by trimmed email", async () => {
    userRepository.findAdminByEmail.mockResolvedValue([{ email: "a@b.com" }]);

    const result = await useCase.execute({ email: "  a@b.com  " });

    expect(userRepository.findAdminByEmail).toHaveBeenCalledWith("a@b.com", 20);
    expect(result).toEqual([{ email: "a@b.com" }]);
  });
});
