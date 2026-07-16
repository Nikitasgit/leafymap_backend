import { findOneFollowQuerySchema } from "@src/api/dto/follows/follow.dto";
import { IFindOneFollowUseCase } from "@src/application/usecases/follows/FindOneFollow.usecase";
import {
  Controller,
  createController,
  validateOrThrow,
} from "@/utils/controllerFactory";

const FindOneFollowController = (
  findOneFollowUseCase: IFindOneFollowUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const { follower, following } = validateOrThrow(
        findOneFollowQuerySchema,
        req.query
      );
      const follow = await findOneFollowUseCase.execute({
        followerId: follower,
        followingId: following,
      });
      return { follow: follow ? { _id: follow.id } : null };
    },
    successMessage: "Follow vérifié avec succès",
  });

export default FindOneFollowController;
