import CreateFollowUseCase from "@src/application/usecases/follows/CreateFollow.usecase";
import DeleteFollowUseCase from "@src/application/usecases/follows/DeleteFollow.usecase";
import GetFollowersUseCase from "@src/application/usecases/follows/GetFollowers.usecase";
import GetFollowingUseCase from "@src/application/usecases/follows/GetFollowing.usecase";
import GetOneFollowUseCase from "@src/application/usecases/follows/GetOneFollow.usecase";
import CreateFollowController from "@src/api/controllers/follows/createFollow.controller";
import DeleteFollowController from "@src/api/controllers/follows/deleteFollow.controller";
import GetFollowersController from "@src/api/controllers/follows/getFollowers.controller";
import GetFollowingController from "@src/api/controllers/follows/getFollowing.controller";
import GetOneFollowController from "@src/api/controllers/follows/getOneFollow.controller";
import MongooseFollowCounterAdapter from "@src/infrastructure/adapters/MongooseFollowCounter.adapter";
import FollowNotifierAdapter from "@src/infrastructure/adapters/FollowNotifier.adapter";
import {
  authMiddleware,
  createNotificationUseCase,
  mongooseFollowRepository,
  mongooseUserRepository,
} from "@src/di/container";

const followCounter = new MongooseFollowCounterAdapter(mongooseUserRepository);
const followNotifier = new FollowNotifierAdapter(createNotificationUseCase);

const createFollowUseCase = new CreateFollowUseCase(
  mongooseFollowRepository,
  followCounter,
  followNotifier
);
const deleteFollowUseCase = new DeleteFollowUseCase(
  mongooseFollowRepository,
  followCounter
);
const getFollowersUseCase = new GetFollowersUseCase(mongooseFollowRepository);
const getFollowingUseCase = new GetFollowingUseCase(mongooseFollowRepository);
const getOneFollowUseCase = new GetOneFollowUseCase(mongooseFollowRepository);

export { authMiddleware };

export const createFollow = CreateFollowController(createFollowUseCase);
export const deleteFollow = DeleteFollowController(deleteFollowUseCase);
export const getFollowers = GetFollowersController(getFollowersUseCase);
export const getFollowing = GetFollowingController(getFollowingUseCase);
export const getOneFollow = GetOneFollowController(getOneFollowUseCase);
