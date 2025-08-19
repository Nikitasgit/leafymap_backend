"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const partnershipController_1 = require("../controllers/partnershipController");
const placeOwnership_1 = __importDefault(require("../middlewares/placeOwnership"));
const router = express_1.default.Router();
router.get("/:placeId/:eventId?", partnershipController_1.getPartnerships);
router.put("/:placeId/:eventId?", auth_1.default, partnershipController_1.updatePartnerships);
router.post("/:placeId/:eventId?", auth_1.default, placeOwnership_1.default, partnershipController_1.createPartnerships);
exports.default = router;
