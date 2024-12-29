import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import initializeDatabase from "../authDb.js";

dotenv.config();

const authRouter = express.Router();

let db;

(async () => {
  db = await initializeDatabase();
  console.log("Db initialized");
})();

authRouter.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run(`INSERT INTO users (username, password) VALUES (?,?)`, [
      username,
      hashedPassword,
    ]);
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
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "Username and password are required." });
  }

  try {
    const user = await db.get(`SELECT * FROM USERS WHERE username = ?`, [
      username,
    ]);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ message: "Username or Password does not match." });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: process.env.JWT_EXPIRY,
      }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.log("Error details:", error);
    res.status(500).json({ message: "Error logging in." });
  }
});

export default authRouter;
