import CreateFollowUseCase from "@src/application/usecases/follows/CreateFollow.usecase";
import DeleteFollowUseCase from "@src/application/usecases/follows/DeleteFollow.usecase";
import FindFollowersUseCase from "@src/application/usecases/follows/FindFollowers.usecase";
import FindFollowingUseCase from "@src/application/usecases/follows/FindFollowing.usecase";
import FindOneFollowUseCase from "@src/application/usecases/follows/FindOneFollow.usecase";
import CreateFollowController from "@src/api/controllers/follows/createFollow.controller";
import DeleteFollowController from "@src/api/controllers/follows/deleteFollow.controller";
import FindFollowersController from "@src/api/controllers/follows/findFollowers.controller";
import FindFollowingController from "@src/api/controllers/follows/findFollowing.controller";
import FindOneFollowController from "@src/api/controllers/follows/findOneFollow.controller";
import LegacyFollowCounterAdapter from "@src/infrastructure/adapters/LegacyFollowCounter.adapter";
import LegacyFollowNotifierAdapter from "@src/infrastructure/adapters/LegacyFollowNotifier.adapter";
import FollowService from "@/services/followService";
import {
  authMiddleware,
  mongooseFollowRepository,
  userRepository,
} from "@/di/container";
import { notificationService } from "@/di/notification.di";

const followService = new FollowService(userRepository);
const followCounter = new LegacyFollowCounterAdapter(followService);
const followNotifier = new LegacyFollowNotifierAdapter(notificationService);

const createFollowUseCase = new CreateFollowUseCase(
  mongooseFollowRepository,
  followCounter,
  followNotifier
);
const deleteFollowUseCase = new DeleteFollowUseCase(
  mongooseFollowRepository,
  followCounter
);
const findFollowersUseCase = new FindFollowersUseCase(mongooseFollowRepository);
const findFollowingUseCase = new FindFollowingUseCase(mongooseFollowRepository);
const findOneFollowUseCase = new FindOneFollowUseCase(mongooseFollowRepository);

export { authMiddleware };

export const createFollow = CreateFollowController(createFollowUseCase);
export const deleteFollow = DeleteFollowController(deleteFollowUseCase);
export const findFollowers = FindFollowersController(findFollowersUseCase);
export const findFollowing = FindFollowingController(findFollowingUseCase);
export const findOneFollow = FindOneFollowController(findOneFollowUseCase);
