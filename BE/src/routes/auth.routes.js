const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const { image } = require("../config/multerConfig");

router.post("/login", AuthController.login);
router.post("/register", image.single("image"), AuthController.register);

module.exports = router;
