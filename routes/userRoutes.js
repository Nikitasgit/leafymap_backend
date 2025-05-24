const express = require("express");
const router = express.Router();
const { createProfile, getUser } = require("../controllers/userController");
const multer = require("multer");
const path = require("path");
const auth = require("../middlewares/auth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({ storage });

router.post(
  "/create-profile",
  auth,
  upload.single("profilePicture"),
  createProfile
);
router.get("/profile", auth, getUser);

module.exports = router;
