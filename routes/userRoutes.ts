import express, { Router } from "express";
import auth from "../middlewares/auth";
import { strictLimiter } from "../middlewares/rateLimiter";
import MongooseUserRepository from "../repositories/users/MongooseUserRepository";
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

// Initialize actions
const getUserByIdAction = new GetUserByIdAction(userRepository);
const getUsersAction = new GetUsersAction(userRepository);
const updateUserAction = new UpdateUserAction(userRepository);
const deleteAccountAction = new DeleteAccountAction(userRepository);

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
router.put("/", auth, updateUserController.handle());
router.delete("/", auth, strictLimiter, deleteAccountController.handle());

export default router;
