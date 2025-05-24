const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./utils/errorHandler");
const userRoutes = require("./routes/userRoutes");
const categorieRoutes = require("./routes/categorieRoutes");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
dotenv.config();

connectDB();

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(cookieParser());
app.use("/api/users", userRoutes);
app.use("/api/categories", categorieRoutes);
app.use("/api/auth", authRoutes);

app.use(errorHandler);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

module.exports = app;
