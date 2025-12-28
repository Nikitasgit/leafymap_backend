import express, { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import PlacesMiddleware from "../middlewares/PlacesMiddleware";
import MongoosePartnershipRepository from "../repositories/partnerships/MongoosePartnershipRepository";
import MongoosePlaceRepository from "../repositories/places/MongoosePlaceRepository";
import MongooseUserRepository from "../repositories/users/MongooseUserRepository";
import CreatePartnershipsAction from "../actions/partnerships/CreatePartnershipsAction";
import UpdatePartnershipsAction from "../actions/partnerships/UpdatePartnershipsAction";
import GetPartnershipsAction from "../actions/partnerships/GetPartnershipsAction";
import GetPartnershipsByUserIdAction from "../actions/partnerships/GetPartnershipsByUserIdAction";
import CreatePartnershipsController from "../controllers/partnerships/createPartnershipsController";
import UpdatePartnershipsController from "../controllers/partnerships/updatePartnershipsController";
import GetPartnershipsController from "../controllers/partnerships/getPartnershipsController";
import GetPartnershipsByUserIdController from "../controllers/partnerships/getPartnershipsByUserIdController";

// Initialize repositories
const partnershipRepository = new MongoosePartnershipRepository();
const placeRepository = new MongoosePlaceRepository();
const userRepository = new MongooseUserRepository();

const authMiddleware = new AuthMiddleware(userRepository);
const placesMiddleware = new PlacesMiddleware(placeRepository);

// Initialize actions
const createPartnershipsAction = new CreatePartnershipsAction(
  partnershipRepository
);
const updatePartnershipsAction = new UpdatePartnershipsAction(
  partnershipRepository
);
const getPartnershipsAction = new GetPartnershipsAction(partnershipRepository);
const getPartnershipsByUserIdAction = new GetPartnershipsByUserIdAction(
  partnershipRepository
);

// Initialize controllers
const createPartnershipsController = new CreatePartnershipsController(
  createPartnershipsAction
);
const updatePartnershipsController = new UpdatePartnershipsController(
  updatePartnershipsAction
);
const getPartnershipsController = new GetPartnershipsController(
  getPartnershipsAction
);
const getPartnershipsByUserIdController = new GetPartnershipsByUserIdController(
  getPartnershipsByUserIdAction
);

const router: Router = express.Router();

// Routes
router.get("/user/:userId", getPartnershipsByUserIdController.handle());
router.get("/:placeId/:eventId?", getPartnershipsController.handle());
router.put(
  "/:placeId/:eventId?",
  authMiddleware.verify(),
  updatePartnershipsController.handle()
);
router.post(
  "/:placeId/:eventId?",
  authMiddleware.verify(),
  placesMiddleware.ownership(),
  createPartnershipsController.handle()
);

export default router;
