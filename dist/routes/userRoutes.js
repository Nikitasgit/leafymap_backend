"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
router.get("/", userController_1.getUsers);
router.get("/:userId", userController_1.getUserById);
router.put("/", auth_1.default, userController_1.updateUser);
router.delete("/", auth_1.default, userController_1.deleteAccount);
exports.default = router;
