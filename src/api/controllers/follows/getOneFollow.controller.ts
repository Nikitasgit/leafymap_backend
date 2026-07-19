import { getOneFollowQuerySchema } from "@src/api/dto/follows/follow.dto";
import type GetOneFollowUseCase from "@src/application/usecases/follows/GetOneFollow.usecase";
import {
  Controller,
  createController,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const GetOneFollowController = (
  getOneFollowUseCase: GetOneFollowUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const { follower, following } = validateOrThrow(
        getOneFollowQuerySchema,
        req.query
      );
      const follow = await getOneFollowUseCase.execute({
        followerId: follower,
        followingId: following,
      });
      return { follow: follow ? { _id: follow.id } : null };
    },
    successMessage: "Follow vérifié avec succès",
  });

export default GetOneFollowController;
