import { FollowRepository, UserRepository } from "@/repositories";
import {
  CreateFollowAction,
  DeleteFollowAction,
  FindFollowersAction,
  FindFollowingAction,
  FindOneFollowAction,
} from "@/actions/follows";
import {
  CreateFollowController,
  DeleteFollowController,
  FindFollowersController,
  FindFollowingController,
  FindOneFollowController,
} from "@/controllers/follows";
import { AuthMiddleware, RateLimiterMiddleware } from "@/middlewares";
import FollowService from "@/services/followService";
import { notificationService } from "@/di/notification.di";

// Initialize repositories
const followRepository = new FollowRepository();
const userRepository = new UserRepository();

// Initialize middlewares
export const authMiddleware = new AuthMiddleware(userRepository);
export const rateLimiterMiddleware = new RateLimiterMiddleware();

// Initialize services
const followService = new FollowService(userRepository);

// Initialize actions
const createFollowAction = new CreateFollowAction(
  followRepository,
  followService,
  notificationService
);
const deleteFollowAction = new DeleteFollowAction(
  followRepository,
  followService
);
const findFollowersAction = new FindFollowersAction(followRepository);
const findFollowingAction = new FindFollowingAction(followRepository);
const findOneFollowAction = new FindOneFollowAction(followRepository);

// Initialize controllers
export const createFollow = CreateFollowController(createFollowAction);
export const deleteFollow = DeleteFollowController(deleteFollowAction);
export const findFollowers = FindFollowersController(findFollowersAction);
export const findFollowing = FindFollowingController(findFollowingAction);
export const findOneFollow = FindOneFollowController(findOneFollowAction);
