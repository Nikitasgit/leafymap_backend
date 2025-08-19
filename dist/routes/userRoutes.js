"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
router.post("/create-creator", auth_1.default, userController_1.addCreator);
router.post("/create-organizer", auth_1.default, userController_1.addOrganizer);
router.put("/update-creator", auth_1.default, userController_1.updateCreator);
router.get("/find-creators", auth_1.default, userController_1.findCreators);
router.get("/creator-in-places-and-events", userController_1.getUserInPlacesAndEvents);
router.get("/:userId", userController_1.getUserById);
router.put("/", auth_1.default, userController_1.updateUser);
exports.default = router;
