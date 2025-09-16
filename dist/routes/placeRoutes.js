"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const placeOwnership_1 = __importDefault(require("../middlewares/placeOwnership"));
const placeController_1 = require("../controllers/placeController");
const eventController_1 = require("../controllers/eventController");
const eventOwnership_1 = __importDefault(require("../middlewares/eventOwnership"));
const router = express_1.default.Router();
router.post("/", auth_1.default, placeController_1.createPlace);
router.put("/:placeId", auth_1.default, placeOwnership_1.default, placeController_1.updatePlace);
router.delete("/:placeId", auth_1.default, placeOwnership_1.default, placeController_1.deletePlace);
router.get("/search", placeController_1.searchPlaces);
router.get("/in-view", placeController_1.getPlacesInView);
router.get("/:placeId", placeController_1.getPlaceById);
// Event routes nested under places
router.get("/:placeId/events", eventController_1.getEventsByPlaceId);
router.post("/:placeId/events", auth_1.default, placeOwnership_1.default, eventController_1.createEvent);
router.get("/:placeId/events/:eventId", eventController_1.getEventById);
router.put("/:placeId/events/:eventId", auth_1.default, placeOwnership_1.default, eventOwnership_1.default, eventController_1.updateEvent);
router.delete("/:placeId/events/:eventId", auth_1.default, placeOwnership_1.default, eventOwnership_1.default, eventController_1.deleteEvent);
exports.default = router;
