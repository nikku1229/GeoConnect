const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const {
  authLimiter,
  forgotPasswordLimiter,
} = require("../middleware/rateLimiter");
const passport = require("passport");
require("../config/passport");
require("dotenv").config();

router.post("/register", authLimiter, authController.register);

router.post("/login", authLimiter, authController.login);

router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  authController.forgotPassword,
);

router.post("/reset-password", authLimiter, authController.resetPassword);

router.get("/profile", authMiddleware, authController.profile);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect(
      `${process.env.CLIENT_PRODUCTION_URL || process.env.CLIENT_URL}/dashboard`,
    );
  },
);

module.exports = router;
