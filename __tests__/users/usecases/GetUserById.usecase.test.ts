import { Types } from "mongoose";
import GetUserByIdUseCase from "@src/application/usecases/users/GetUserById.usecase";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { ERROR_CODES } from "@src/shared/errors";
import { createMockUserRepository } from "../../helpers/mockUserRepository";

const mockObjectId = (): string => new Types.ObjectId().toString();

describe("GetUserByIdUseCase", () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let useCase: GetUserByIdUseCase;

  beforeEach(() => {
    userRepository = createMockUserRepository();
    useCase = new GetUserByIdUseCase(userRepository);
  });

  it("returns the user details when found", async () => {
    const userId = mockObjectId();
    const details = { _id: userId, username: "alice" };
    userRepository.findDetailsById.mockResolvedValue(details);

    const result = await useCase.execute({ userId });

    expect(result).toEqual(details);
    expect(userRepository.findDetailsById).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({ project: expect.any(Array) })
    );
  });

  it("uses a custom project when provided", async () => {
    const userId = mockObjectId();
    const project = ["email", "username"];
    userRepository.findDetailsById.mockResolvedValue({ _id: userId });

    await useCase.execute({ userId, project });

    expect(userRepository.findDetailsById).toHaveBeenCalledWith(userId, {
      project,
    });
  });

  it("throws when the user is not found", async () => {
    userRepository.findDetailsById.mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: mockObjectId() })
    ).rejects.toMatchObject({
      code: ERROR_CODES.USER_NOT_FOUND,
      statusCode: 404,
    });
  });
});
