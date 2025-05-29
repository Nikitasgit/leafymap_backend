const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const upload = require("../middlewares/uploadToS3");
const {
  getUser,
  updateCreator,
  addCreator,
  addOrganizer,
  findUsers,
} = require("../controllers/userController");

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

router.get("/find-users", findUsers);
module.exports = router;
