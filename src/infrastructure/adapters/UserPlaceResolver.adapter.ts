import { IUserPlaceResolver } from "@src/domain/interfaces/IUserPlaceResolver";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { PlaceId, UserId } from "@src/domain/value-objects/ObjectId.vo";

class UserPlaceResolverAdapter implements IUserPlaceResolver {
  constructor(private readonly userRepository: IUserRepository) {}

  async findPlaceIdByUserId(userId: UserId): Promise<PlaceId | null> {
    const user = await this.userRepository.findById(userId);
    return user?.placeId ?? null;
  }
}

export default UserPlaceResolverAdapter;
