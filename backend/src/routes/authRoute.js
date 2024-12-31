import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const authRouter = express.Router();

authRouter.post("/register", async (req, res) => {
  let db = req.db;
  const { username, email, password } = req.body;

  if (!username || !password || !email) {
    return res
      .status(400)
      .json({ message: "Username, Email and password are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run(
      `INSERT INTO Users (username, email, password_hash) VALUES (?,?,?)`,
      [username, email, hashedPassword]
    );
    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Error details:", error);
    if (error.message.includes("UNIQUE constraint failed")) {
      res.status(400).json({ message: "User already exists." });
    } else {
      res.status(500).json({ message: "Error registering user." });
    }
  }
});

authRouter.post("/login", async (req, res) => {
  let db = req.db;
  const { username, email, password } = req.body;

  if ((!username && !email) || !password) {
    res
      .status(400)
      .json({ message: "Username or Email, and password are required." });
  }

  try {
    let user = undefined;
    if (username) {
      user = await db.get(`SELECT * FROM USERS WHERE username = ?`, [username]);
    } else {
      user = await db.get(`SELECT * FROM USERS WHERE email = ?`, [email]);
    }
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Credentials do not match." });
    }
    const token = jwt.sign(
      { id: user.user_id, username: user.username, email: user.email },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: process.env.JWT_EXPIRY,
      }
    );

    return res.status(200).json({ token });
  } catch (error) {
    console.log("Error details:", error);
    res.status(500).json({ message: "Error logging in." });
  }
});

export default authRouter;
