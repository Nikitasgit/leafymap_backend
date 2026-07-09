import { IPlaceRepository } from "@/types/repositories/place.repository.types";
import { IUserRepository } from "@/types/repositories/user.repository.types";
import CascadeDeleteService from "@/services/cascadeDeleteService";
import logger from "@/utils/logger";

export interface IDeletePlaceAction {
  execute(params: { placeId: string }): Promise<void>;
}

class DeletePlaceAction implements IDeletePlaceAction {
  constructor(
    private placeRepository: IPlaceRepository,
    private userRepository: IUserRepository,
    private cascadeDeleteService: CascadeDeleteService
  ) {}

  async execute({ placeId }: { placeId: string }): Promise<void> {
    const place = await this.placeRepository.findById(placeId, ["_id", "user"]);

    if (!place) {
      throw new Error("Place not found");
    }

    await this.cascadeDeleteService.deletePlace(placeId);

    await this.userRepository.updateOne(place.user.toString(), {
      $unset: { place: 1 },
    });

    logger.info(`Place ${placeId} and associated data deleted successfully`);
  }
}

export default DeletePlaceAction;
