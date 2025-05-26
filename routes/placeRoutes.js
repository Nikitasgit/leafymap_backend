const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const { updatePlace, getPlaceById } = require("../controllers/placeController");
const upload = require("../middlewares/uploadToS3");

router.get("/:id", getPlaceById);
router.put("/update-place", auth, upload.single("placeImg"), updatePlace);

module.exports = router;
