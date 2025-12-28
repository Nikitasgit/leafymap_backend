import express, { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import RateLimiterMiddleware from "../middlewares/RateLimiterMiddleware";
import MongooseUserRepository from "../repositories/users/MongooseUserRepository";
import MongoosePlaceRepository from "../repositories/places/MongoosePlaceRepository";
import MongooseEventRepository from "../repositories/events/MongooseEventRepository";
import MongoosePartnershipRepository from "../repositories/partnerships/MongoosePartnershipRepository";
import GetUserByIdAction from "../actions/users/GetUserByIdAction";
import GetUsersAction from "../actions/users/GetUsersAction";
import UpdateUserAction from "../actions/users/UpdateUserAction";
import DeleteAccountAction from "../actions/users/DeleteAccountAction";
import GetUserByIdController from "../controllers/users/getUserByIdController";
import GetUsersController from "../controllers/users/getUsersController";
import UpdateUserController from "../controllers/users/updateUserController";
import DeleteAccountController from "../controllers/users/deleteAccountController";

// Initialize repositories
const userRepository = new MongooseUserRepository();
const placeRepository = new MongoosePlaceRepository();
const eventRepository = new MongooseEventRepository();
const partnershipRepository = new MongoosePartnershipRepository();

const authMiddleware = new AuthMiddleware(userRepository);
const rateLimiterMiddleware = new RateLimiterMiddleware();

// Initialize actions
const getUserByIdAction = new GetUserByIdAction(userRepository);
const getUsersAction = new GetUsersAction(userRepository);
const updateUserAction = new UpdateUserAction(userRepository);
const deleteAccountAction = new DeleteAccountAction(
  userRepository,
  placeRepository,
  eventRepository,
  partnershipRepository
);

// Initialize controllers
const getUserByIdController = new GetUserByIdController(getUserByIdAction);
const getUsersController = new GetUsersController(getUsersAction);
const updateUserController = new UpdateUserController(updateUserAction);
const deleteAccountController = new DeleteAccountController(
  deleteAccountAction
);

const router: Router = express.Router();

router.get("/", getUsersController.handle());
router.get("/:userId", getUserByIdController.handle());
router.put("/", authMiddleware.verify(), updateUserController.handle());
router.delete(
  "/",
  authMiddleware.verify(),
  rateLimiterMiddleware.strict(),
  deleteAccountController.handle()
);

export default router;
