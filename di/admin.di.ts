import {
  EventRepository,
  ImageRepository,
  PlaceRepository,
  UserRepository,
} from "@/repositories";
import { AdminMiddleware, AuthMiddleware } from "@/middlewares";
import BanAdminUserAction from "@/actions/admin/BanAdminUser.action";
import GetAdminUserAction from "@/actions/admin/GetAdminUser.action";
import GetAdminUserContentAction from "@/actions/admin/GetAdminUserContent.action";
import SearchAdminUsersAction from "@/actions/admin/SearchAdminUsers.action";
import SoftDeleteAdminResourceAction from "@/actions/admin/SoftDeleteAdminResource.action";
import SoftDeleteAdminUserAction from "@/actions/admin/SoftDeleteAdminUser.action";
import BanAdminUserController from "@/controllers/admin/BanAdminUser.controller";
import GetAdminUserController from "@/controllers/admin/GetAdminUser.controller";
import GetAdminUserContentController from "@/controllers/admin/GetAdminUserContent.controller";
import SearchAdminUsersController from "@/controllers/admin/SearchAdminUsers.controller";
import SoftDeleteAdminResourceController from "@/controllers/admin/SoftDeleteAdminResource.controller";
import SoftDeleteAdminUserController from "@/controllers/admin/SoftDeleteAdminUser.controller";
import {
  mongooseCommentRepository,
  mongooseReviewRepository,
} from "@/di/container";

const userRepository = new UserRepository();
const eventRepository = new EventRepository();
const placeRepository = new PlaceRepository();
const imageRepository = new ImageRepository();

export const authMiddleware = new AuthMiddleware(userRepository);
export const adminMiddleware = new AdminMiddleware(userRepository);

const searchAdminUsersAction = new SearchAdminUsersAction(userRepository);
const getAdminUserAction = new GetAdminUserAction(userRepository);
const getAdminUserContentAction = new GetAdminUserContentAction(
  eventRepository,
  placeRepository,
  imageRepository,
  mongooseReviewRepository,
  mongooseCommentRepository
);
const banAdminUserAction = new BanAdminUserAction(userRepository);
const softDeleteAdminResourceAction = new SoftDeleteAdminResourceAction(
  eventRepository,
  placeRepository,
  imageRepository,
  mongooseReviewRepository,
  mongooseCommentRepository
);
const softDeleteAdminUserAction = new SoftDeleteAdminUserAction(userRepository);

export const searchAdminUsers = SearchAdminUsersController(
  searchAdminUsersAction
);
export const getAdminUser = GetAdminUserController(getAdminUserAction);
export const getAdminUserContent = GetAdminUserContentController(
  getAdminUserContentAction
);
export const banAdminUser = BanAdminUserController(banAdminUserAction);
export const softDeleteAdminResource = SoftDeleteAdminResourceController(
  softDeleteAdminResourceAction
);
export const softDeleteAdminUser = SoftDeleteAdminUserController(
  softDeleteAdminUserAction
);
