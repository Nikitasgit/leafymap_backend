import express, { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import RateLimiterMiddleware from "../middlewares/RateLimiterMiddleware";
import MongooseUserRepository from "../repositories/users/MongooseUserRepository";
import RegisterAction from "../actions/auth/RegisterAction";
import SignInAction from "../actions/auth/SignInAction";
import GetUserByIdAction from "../actions/users/GetUserByIdAction";
import RegisterController from "../controllers/auth/registerController";
import SignInController from "../controllers/auth/signInController";
import SignOutController from "../controllers/auth/signOutController";
import GetCurrentUserController from "../controllers/auth/getCurrentUserController";

const userRepository = new MongooseUserRepository();

const authMiddleware = new AuthMiddleware(userRepository);
const rateLimiterMiddleware = new RateLimiterMiddleware();

const registerAction = new RegisterAction(userRepository);
const signInAction = new SignInAction(userRepository);
const getUserByIdAction = new GetUserByIdAction(userRepository);

const registerController = new RegisterController(registerAction);
const signInController = new SignInController(signInAction);
const signOutController = new SignOutController();
const getCurrentUserController = new GetCurrentUserController(
  getUserByIdAction
);

const router: Router = express.Router();

router.post(
  "/register",
  rateLimiterMiddleware.auth(),
  registerController.handle()
);
router.post("/signin", rateLimiterMiddleware.auth(), signInController.handle());
router.post("/signout", signOutController.handle());
router.get("/me", authMiddleware.verify(), getCurrentUserController.handle());

export default router;
