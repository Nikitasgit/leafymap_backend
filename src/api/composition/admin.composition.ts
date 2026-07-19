import BanAdminUserController from "@src/api/controllers/admin/banAdminUser.controller";
import GetAdminUserController from "@src/api/controllers/admin/getAdminUser.controller";
import GetAdminUserContentController from "@src/api/controllers/admin/getAdminUserContent.controller";
import SearchAdminUsersController from "@src/api/controllers/admin/searchAdminUsers.controller";
import SoftDeleteAdminResourceController from "@src/api/controllers/admin/softDeleteAdminResource.controller";
import SoftDeleteAdminUserController from "@src/api/controllers/admin/softDeleteAdminUser.controller";
import BanAdminUserUseCase from "@src/application/usecases/admin/BanAdminUser.usecase";
import GetAdminUserContentUseCase from "@src/application/usecases/admin/GetAdminUserContent.usecase";
import GetAdminUserUseCase from "@src/application/usecases/admin/GetAdminUser.usecase";
import RestoreAdminResourceUseCase from "@src/application/usecases/admin/RestoreAdminResource.usecase";
import RestoreAdminUserUseCase from "@src/application/usecases/admin/RestoreAdminUser.usecase";
import SearchAdminUsersUseCase from "@src/application/usecases/admin/SearchAdminUsers.usecase";
import SoftDeleteAdminResourceUseCase from "@src/application/usecases/admin/SoftDeleteAdminResource.usecase";
import SoftDeleteAdminUserUseCase from "@src/application/usecases/admin/SoftDeleteAdminUser.usecase";
import UnbanAdminUserUseCase from "@src/application/usecases/admin/UnbanAdminUser.usecase";
import {
  adminMiddleware,
  authMiddleware,
  mongooseCommentRepository,
  mongooseEventRepository,
  mongooseImageRepository,
  mongoosePlaceRepository,
  mongooseReviewRepository,
  mongooseUserRepository,
} from "@src/di/container";

const searchAdminUsersUseCase = new SearchAdminUsersUseCase(
  mongooseUserRepository
);
const getAdminUserUseCase = new GetAdminUserUseCase(mongooseUserRepository);
const getAdminUserContentUseCase = new GetAdminUserContentUseCase(
  mongooseEventRepository,
  mongoosePlaceRepository,
  mongooseImageRepository,
  mongooseReviewRepository,
  mongooseCommentRepository
);
const banAdminUserUseCase = new BanAdminUserUseCase(mongooseUserRepository);
const unbanAdminUserUseCase = new UnbanAdminUserUseCase(mongooseUserRepository);
const softDeleteAdminUserUseCase = new SoftDeleteAdminUserUseCase(
  mongooseUserRepository
);
const restoreAdminUserUseCase = new RestoreAdminUserUseCase(
  mongooseUserRepository
);
const softDeleteAdminResourceUseCase = new SoftDeleteAdminResourceUseCase(
  mongooseEventRepository,
  mongoosePlaceRepository,
  mongooseImageRepository,
  mongooseReviewRepository,
  mongooseCommentRepository
);
const restoreAdminResourceUseCase = new RestoreAdminResourceUseCase(
  mongooseEventRepository,
  mongoosePlaceRepository,
  mongooseImageRepository,
  mongooseReviewRepository,
  mongooseCommentRepository
);

export { authMiddleware, adminMiddleware };

export const searchAdminUsers = SearchAdminUsersController(
  searchAdminUsersUseCase
);
export const getAdminUser = GetAdminUserController(getAdminUserUseCase);
export const getAdminUserContent = GetAdminUserContentController(
  getAdminUserContentUseCase
);
export const banAdminUser = BanAdminUserController(
  banAdminUserUseCase,
  unbanAdminUserUseCase
);
export const softDeleteAdminUser = SoftDeleteAdminUserController(
  softDeleteAdminUserUseCase,
  restoreAdminUserUseCase
);
export const softDeleteAdminResource = SoftDeleteAdminResourceController(
  softDeleteAdminResourceUseCase,
  restoreAdminResourceUseCase
);
