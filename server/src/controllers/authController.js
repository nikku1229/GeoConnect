const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const dotenv = require("dotenv");
const { Resend } = require("resend");

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ user, token });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ user, token });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 3600000;

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const msg = {
      from: process.env.EMAIL_FROM,
      to: "niteshsharma5740@gmail.com",
      subject: "Password Reset - GeoConnect",
      html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset password:</p>

      <a href="${resetUrl}">
        Reset Password
      </a>

      <p>${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      `,
    };

    const response = await resend.emails.send(msg);

    res.json({ message: "Reset email sent" });
  } catch (error) {
    console.log("RESEND ERROR:", error.response?.body || error);

    res.status(500).json({
      message: "Email sending failed",
      error: error.response?.body || error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 10);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Password reset failed" });
  }
};

const profile = async (req, res) => {
  res.json(req.user);
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  profile,
};
