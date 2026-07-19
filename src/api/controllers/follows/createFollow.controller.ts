import { createFollowSchema } from "@src/api/dto/follows/follow.dto";
import type CreateFollowUseCase from "@src/application/usecases/follows/CreateFollow.usecase";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const CreateFollowController = (
  createFollowUseCase: CreateFollowUseCase
): Controller =>
  createController({
    execute: (req) => {
      const { followingId } = validateOrThrow(createFollowSchema, req.body);
      return createFollowUseCase.execute({
        followerId: requireAuth(req).id,
        followingId,
      });
    },
    successMessage: "Follow créé avec succès",
    successStatus: 201,
    mapResult: (result) => ({ _id: result.id }),
  });

export default CreateFollowController;
