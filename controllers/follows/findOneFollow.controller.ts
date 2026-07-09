import { findOneFollowQuerySchema } from "../../validations/follow.validations";
import { IFindOneFollowAction } from "@/actions/follows";
import { Controller, createController, validateOrThrow } from "@/utils/controllerFactory";

const FindOneFollowController = (
  findOneFollowAction: IFindOneFollowAction
): Controller =>
  createController({
    execute: async (req) => {
      const { follower, following } = validateOrThrow(
        findOneFollowQuerySchema,
        req.query
      );
      const follow = await findOneFollowAction.execute({
        followerId: follower,
        followingId: following,
      });
      return { follow: follow ? { _id: follow._id.toString() } : null };
    },
    successMessage: "Follow vérifié avec succès",
  });

export default FindOneFollowController;
