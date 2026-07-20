import { asClass, AwilixContainer } from "awilix";
import AdminResourcesController from "@src/api/controllers/AdminResourcesController";
import AdminUsersController from "@src/api/controllers/AdminUsersController";
import BanAdminUserUseCase from "@src/application/usecases/admin/BanAdminUser.usecase";
import GetAdminUserContentUseCase from "@src/application/usecases/admin/GetAdminUserContent.usecase";
import GetAdminUserUseCase from "@src/application/usecases/admin/GetAdminUser.usecase";
import RestoreAdminResourceUseCase from "@src/application/usecases/admin/RestoreAdminResource.usecase";
import RestoreAdminUserUseCase from "@src/application/usecases/admin/RestoreAdminUser.usecase";
import SearchAdminUsersUseCase from "@src/application/usecases/admin/SearchAdminUsers.usecase";
import SoftDeleteAdminResourceUseCase from "@src/application/usecases/admin/SoftDeleteAdminResource.usecase";
import SoftDeleteAdminUserUseCase from "@src/application/usecases/admin/SoftDeleteAdminUser.usecase";
import UnbanAdminUserUseCase from "@src/application/usecases/admin/UnbanAdminUser.usecase";
import type { Cradle } from "@src/di/cradle";

export const registerAdminModule = (
  container: AwilixContainer<Cradle>
): void => {
  container.register({
    searchAdminUsersUseCase: asClass(SearchAdminUsersUseCase).singleton(),
    getAdminUserUseCase: asClass(GetAdminUserUseCase).singleton(),
    getAdminUserContentUseCase: asClass(GetAdminUserContentUseCase).singleton(),
    banAdminUserUseCase: asClass(BanAdminUserUseCase).singleton(),
    unbanAdminUserUseCase: asClass(UnbanAdminUserUseCase).singleton(),
    softDeleteAdminUserUseCase: asClass(SoftDeleteAdminUserUseCase).singleton(),
    restoreAdminUserUseCase: asClass(RestoreAdminUserUseCase).singleton(),
    softDeleteAdminResourceUseCase: asClass(
      SoftDeleteAdminResourceUseCase
    ).singleton(),
    restoreAdminResourceUseCase: asClass(
      RestoreAdminResourceUseCase
    ).singleton(),

    adminUsersController: asClass(AdminUsersController).singleton(),
    adminResourcesController: asClass(AdminResourcesController).singleton(),
  });
};
