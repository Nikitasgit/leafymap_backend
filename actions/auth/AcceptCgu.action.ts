import { IUserRepository } from "@/types/repositories/user.repository.types";

export interface IAcceptCguAction {
  execute(params: {
    userId: string;
    emailNotifications?: boolean;
  }): Promise<void>;
}

class AcceptCguAction implements IAcceptCguAction {
  constructor(private userRepository: IUserRepository) {}

  async execute({
    userId,
    emailNotifications,
  }: {
    userId: string;
    emailNotifications?: boolean;
  }): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    await this.userRepository.updateOne(userId, {
      acceptedCGU: true,
      acceptedAt: new Date(),
      preferences: {
        ...(user.preferences ?? {}),
        emailNotifications: emailNotifications === true,
      },
    });
  }
}

export default AcceptCguAction;
