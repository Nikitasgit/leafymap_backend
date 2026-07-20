import { RequestHandler } from "express";
import {
  createFollowSchema,
  getOneFollowQuerySchema,
} from "@src/api/dto/follows/follow.dto";
import { BaseHttpController } from "@src/api/http/BaseHttpController";
import {
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@src/api/http/controllerFactory";
import type CreateFollowUseCase from "@src/application/usecases/follows/CreateFollow.usecase";
import type DeleteFollowUseCase from "@src/application/usecases/follows/DeleteFollow.usecase";
import type GetFollowersUseCase from "@src/application/usecases/follows/GetFollowers.usecase";
import type GetFollowingUseCase from "@src/application/usecases/follows/GetFollowing.usecase";
import type GetOneFollowUseCase from "@src/application/usecases/follows/GetOneFollow.usecase";

class FollowsController extends BaseHttpController {
  constructor(
    private readonly createFollowUseCase: CreateFollowUseCase,
    private readonly deleteFollowUseCase: DeleteFollowUseCase,
    private readonly getFollowersUseCase: GetFollowersUseCase,
    private readonly getFollowingUseCase: GetFollowingUseCase,
    private readonly getOneFollowUseCase: GetOneFollowUseCase
  ) {
    super();
  }

  create(): RequestHandler {
    return this.handler({
      execute: (req) => {
        const { followingId } = validateOrThrow(createFollowSchema, req.body);
        return this.createFollowUseCase.execute({
          followerId: requireAuth(req).id,
          followingId,
        });
      },
      successMessage: "Follow créé avec succès",
      successStatus: 201,
      mapResult: (result) => ({ id: result.id }),
    });
  }

  delete(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        await this.deleteFollowUseCase.execute({
          followId: requireObjectIdParam(req, "followId"),
          followerId: requireAuth(req).id,
        });
      },
      successMessage: "Follow supprimé avec succès",
    });
  }

  listFollowers(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const followers = await this.getFollowersUseCase.execute({
          userId: requireObjectIdParam(req, "userId"),
        });
        return { followers };
      },
      successMessage: "Followers récupérés avec succès",
    });
  }

  listFollowing(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const following = await this.getFollowingUseCase.execute({
          userId: requireObjectIdParam(req, "userId"),
        });
        return { following };
      },
      successMessage: "Following récupérés avec succès",
    });
  }

  getOne(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const { follower, following } = validateOrThrow(
          getOneFollowQuerySchema,
          req.query
        );
        const follow = await this.getOneFollowUseCase.execute({
          followerId: follower,
          followingId: following,
        });
        return { follow: follow ? { id: follow.id } : null };
      },
      successMessage: "Follow vérifié avec succès",
    });
  }
}

export default FollowsController;
