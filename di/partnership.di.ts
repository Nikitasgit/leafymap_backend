import {
  PartnershipRepository,
  PlaceRepository,
  UserRepository,
  MessageRepository,
  ConversationRepository,
} from "@/repositories";
import {
  CreatePartnershipsAction,
  UpdatePartnershipsAction,
  GetPartnershipsAction,
  GetPartnershipsByUserIdAction,
  GetUserPlacesPartnershipsByUserIdAction,
} from "@/actions/partnerships";
import {
  CreatePartnershipsController,
  UpdatePartnershipsController,
  GetPartnershipsController,
  GetPartnershipsByUserIdController,
  GetUserPlacesPartnershipsByUserIdController,
} from "@/controllers/partnerships";
import { AuthMiddleware, PlacesMiddleware } from "@/middlewares";

// Initialize repositories
const partnershipRepository = new PartnershipRepository();
const placeRepository = new PlaceRepository();
const userRepository = new UserRepository();
const messageRepository = new MessageRepository();
const conversationRepository = new ConversationRepository();

// Initialize middlewares
export const authMiddleware = new AuthMiddleware(userRepository);
export const placesMiddleware = new PlacesMiddleware(placeRepository);

// Initialize actions
const createPartnershipsAction = new CreatePartnershipsAction(
  partnershipRepository,
  messageRepository,
  conversationRepository
);
const updatePartnershipsAction = new UpdatePartnershipsAction(
  partnershipRepository
);
const getPartnershipsAction = new GetPartnershipsAction(partnershipRepository);
const getPartnershipsByUserIdAction = new GetPartnershipsByUserIdAction(
  partnershipRepository
);
const getUserPlacesPartnershipsByUserIdAction =
  new GetUserPlacesPartnershipsByUserIdAction(partnershipRepository);

// Initialize controllers
export const createPartnership = new CreatePartnershipsController(
  createPartnershipsAction
);
export const updatePartnership = new UpdatePartnershipsController(
  updatePartnershipsAction
);
export const getPartnerships = new GetPartnershipsController(
  getPartnershipsAction
);
export const getPartnershipsByUserId = new GetPartnershipsByUserIdController(
  getPartnershipsByUserIdAction
);
export const getUserPlacesPartnerships =
  new GetUserPlacesPartnershipsByUserIdController(
    getUserPlacesPartnershipsByUserIdAction
  );
