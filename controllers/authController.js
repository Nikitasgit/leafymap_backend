const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res) => {
  const { email, password, username } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashed, username });

    res.status(201).json({ message: "User registered" });
  } catch (err) {
    console.error("Error in register:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const signIn = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        userType: user.userType,
      },
      JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 86400000, // 1 day
      })
      .cookie("logged_in", "true", {
        httpOnly: false, // readable from JavaScript
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 86400000,
      })
      .json({ message: "Logged in", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const signOut = async (req, res) => {
  res
    .clearCookie("token")
    .clearCookie("logged_in")
    .clearCookie("userType")
    .json({ message: "Logged out" });
};

module.exports = { register, signIn, signOut };
