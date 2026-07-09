import { createFollowSchema } from "../../validations/follow.validations";
import { ICreateFollowAction } from "@/actions/follows";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@/utils/controllerFactory";

const CreateFollowController = (
  createFollowAction: ICreateFollowAction
): Controller =>
  createController({
    execute: (req) => {
      const { followingId } = validateOrThrow(createFollowSchema, req.body);
      return createFollowAction.execute({
        followerId: requireAuth(req).id,
        followingId,
      });
    },
    successMessage: "Follow créé avec succès",
    successStatus: 201,
  });

export default CreateFollowController;
