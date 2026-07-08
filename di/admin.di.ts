import {
  CommentRepository,
  EventRepository,
  ImageRepository,
  PlaceRepository,
  ReviewRepository,
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

const userRepository = new UserRepository();
const eventRepository = new EventRepository();
const placeRepository = new PlaceRepository();
const imageRepository = new ImageRepository();
const reviewRepository = new ReviewRepository();
const commentRepository = new CommentRepository();

export const authMiddleware = new AuthMiddleware(userRepository);
export const adminMiddleware = new AdminMiddleware(userRepository);

const searchAdminUsersAction = new SearchAdminUsersAction(userRepository);
const getAdminUserAction = new GetAdminUserAction(userRepository);
const getAdminUserContentAction = new GetAdminUserContentAction(
  eventRepository,
  placeRepository,
  imageRepository,
  reviewRepository,
  commentRepository
);
const banAdminUserAction = new BanAdminUserAction(userRepository);
const softDeleteAdminResourceAction = new SoftDeleteAdminResourceAction(
  eventRepository,
  placeRepository,
  imageRepository,
  reviewRepository,
  commentRepository
);
const softDeleteAdminUserAction = new SoftDeleteAdminUserAction(userRepository);

export const searchAdminUsers = new SearchAdminUsersController(
  searchAdminUsersAction
);
export const getAdminUser = new GetAdminUserController(getAdminUserAction);
export const getAdminUserContent = new GetAdminUserContentController(
  getAdminUserContentAction
);
export const banAdminUser = new BanAdminUserController(banAdminUserAction);
export const softDeleteAdminResource = new SoftDeleteAdminResourceController(
  softDeleteAdminResourceAction
);
export const softDeleteAdminUser = new SoftDeleteAdminUserController(
  softDeleteAdminUserAction
);
