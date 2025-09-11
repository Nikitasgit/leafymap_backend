"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const auth_1 = __importDefault(require("../middlewares/auth"));
const router = express_1.default.Router();
router.post("/register", authController_1.register);
router.post("/signin", authController_1.signIn);
router.post("/signout", authController_1.signOut);
router.get("/verify", authController_1.verifyToken);
router.get("/me", auth_1.default, authController_1.getCurrentUser);
exports.default = router;
