const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const {
  updatePlace,
  getPlaceById,
  getPlacesInView,
} = require("../controllers/placeController");
const upload = require("../middlewares/uploadToS3");

router.get("/in-view", getPlacesInView);
router.get("/:id", getPlaceById);
router.put("/:id", auth, upload.single("image"), updatePlace);

module.exports = router;
