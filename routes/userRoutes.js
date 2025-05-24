const express = require("express");
const router = express.Router();
const {
  createProfile,
  getUser,
  updateCreator,
  addCreator,
  addOrganizer,
} = require("../controllers/userController");
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
  "/create-creator",
  auth,
  upload.single("profilePicture"),
  addCreator
);
router.post(
  "/create-organizer",
  auth,
  upload.single("profilePicture"),
  addOrganizer
);
router.put(
  "/update-creator",
  auth,
  upload.single("profilePicture"),
  updateCreator
);
router.get("/profile", auth, getUser);

module.exports = router;
