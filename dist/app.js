"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const errorHandler_1 = __importDefault(require("./utils/errorHandler"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const categorieRoutes_1 = __importDefault(require("./routes/categorieRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const placeRoutes_1 = __importDefault(require("./routes/placeRoutes"));
const eventRoutes_1 = __importDefault(require("./routes/eventRoutes"));
const partnershipRoutes_1 = __importDefault(require("./routes/partnershipRoutes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const imageRoutes_1 = __importDefault(require("./routes/imageRoutes"));
dotenv_1.default.config();
(0, db_1.default)();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "https://spotlight-project.vercel.app",
        "https://api.server.innovastay.fr",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
}));
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
app.use((0, cookie_parser_1.default)());
app.use("/api/users", userRoutes_1.default);
app.use("/api/categories", categorieRoutes_1.default);
app.use("/api/auth", authRoutes_1.default);
app.use("/api/places", placeRoutes_1.default);
app.use("/api/events", eventRoutes_1.default);
app.use("/api/images", imageRoutes_1.default);
app.use("/api/partnerships", partnershipRoutes_1.default);
app.use(errorHandler_1.default);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Something went wrong!",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});
exports.default = app;
