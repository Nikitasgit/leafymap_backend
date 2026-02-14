import { IUserRepository } from "@/types/repositories/user.repository.types";

export interface IAcceptCguAction {
  execute(params: { userId: string }): Promise<void>;
}

class AcceptCguAction implements IAcceptCguAction {
  constructor(private userRepository: IUserRepository) {}

  async execute({ userId }: { userId: string }): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    await this.userRepository.updateOne(userId, {
      acceptedCGU: true,
      acceptedAt: new Date(),
    });
  }
}

export default AcceptCguAction;
