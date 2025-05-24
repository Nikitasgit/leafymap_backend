const express = require("express");
const router = express.Router();
const { register, signIn, signOut } = require("../controllers/authController");

router.post("/register", register);
router.post("/signin", signIn);
router.post("/signout", signOut);

module.exports = router;
