import { asClass, AwilixContainer } from "awilix";
import FollowsController from "@src/api/controllers/FollowsController";
import CreateFollowUseCase from "@src/application/usecases/follows/CreateFollow.usecase";
import DeleteFollowUseCase from "@src/application/usecases/follows/DeleteFollow.usecase";
import GetFollowersUseCase from "@src/application/usecases/follows/GetFollowers.usecase";
import GetFollowingUseCase from "@src/application/usecases/follows/GetFollowing.usecase";
import GetOneFollowUseCase from "@src/application/usecases/follows/GetOneFollow.usecase";
import FollowNotifierAdapter from "@src/infrastructure/adapters/FollowNotifier.adapter";
import MongooseFollowCounterAdapter from "@src/infrastructure/adapters/MongooseFollowCounter.adapter";
import type { Cradle } from "@src/di/cradle";

export const registerFollowsModule = (
  container: AwilixContainer<Cradle>
): void => {
  container.register({
    followCounter: asClass(MongooseFollowCounterAdapter).singleton(),
    followNotifier: asClass(FollowNotifierAdapter).singleton(),
    createFollowUseCase: asClass(CreateFollowUseCase).singleton(),
    deleteFollowUseCase: asClass(DeleteFollowUseCase).singleton(),
    getFollowersUseCase: asClass(GetFollowersUseCase).singleton(),
    getFollowingUseCase: asClass(GetFollowingUseCase).singleton(),
    getOneFollowUseCase: asClass(GetOneFollowUseCase).singleton(),

    followsController: asClass(FollowsController).singleton(),
  });
};
