const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const authRoutes = require("./routes/authRoutes");
const passport = require("./config/passport");
const session = require("express-session");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

const connectDB = require("./config/db");
connectDB();

app.use("/api/auth", authRoutes);

app.use(
  session({
    secret: "geoconnectsecret",
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("GeoConnect API Running");
});

module.exports = app;
