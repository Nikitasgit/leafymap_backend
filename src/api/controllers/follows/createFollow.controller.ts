import { createFollowSchema } from "@src/api/dto/follows/follow.dto";
import { ICreateFollowUseCase } from "@src/application/usecases/follows/CreateFollow.usecase";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@/utils/controllerFactory";

const CreateFollowController = (
  createFollowUseCase: ICreateFollowUseCase
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
