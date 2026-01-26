import { IUserRepository } from "@/types/repositories/user.repository.types";
import { IUser } from "@/types/models/user";

export interface IGetUserByIdAction {
  execute(params: {
    userId: string;
    project?: (keyof IUser | string)[];
  }): Promise<IUser>;
}

class GetUserByIdAction implements IGetUserByIdAction {
  private readonly defaultProject: (keyof IUser | string)[] = [
    "_id",
    "firstname",
    "lastname",
    "username",
    "userType",
    "website",
    "phone",
    "description",
    "country",
    "followers",
    "place._id",
    "image.urls",
    "userCategories.name",
    "userCategories.userCategoryType",
  ];

  constructor(private userRepository: IUserRepository) {}

  async execute({
    userId,
    project,
  }: {
    userId: string;
    project?: (keyof IUser | string)[];
  }): Promise<IUser> {
    const user = await this.userRepository.findOne(
      { _id: userId, deleted: false },
      project || this.defaultProject
    );

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}

export default GetUserByIdAction;
