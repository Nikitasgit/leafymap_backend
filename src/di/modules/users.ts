import { asClass, AwilixContainer } from "awilix";
import UsersController from "@src/api/controllers/UsersController";
import DeleteAccountUseCase from "@src/application/usecases/users/DeleteAccount.usecase";
import GetUserByIdUseCase from "@src/application/usecases/users/GetUserById.usecase";
import GetUserProfileUseCase from "@src/application/usecases/users/GetUserProfile.usecase";
import GetUsersUseCase from "@src/application/usecases/users/GetUsers.usecase";
import UpdateUserUseCase from "@src/application/usecases/users/UpdateUser.usecase";
import type { Cradle } from "@src/di/cradle";

export const registerUsersModule = (
  container: AwilixContainer<Cradle>
): void => {
  container.register({
    getUserByIdUseCase: asClass(GetUserByIdUseCase).singleton(),
    getUserProfileUseCase: asClass(GetUserProfileUseCase).singleton(),
    getUsersUseCase: asClass(GetUsersUseCase).singleton(),
    updateUserUseCase: asClass(UpdateUserUseCase).singleton(),
    deleteAccountUseCase: asClass(DeleteAccountUseCase).singleton(),

    usersController: asClass(UsersController).singleton(),
  });
};
