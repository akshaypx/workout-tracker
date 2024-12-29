import express from "express";
import authenticateToken from "../middlewares/authMiddleware.js";

const protectedRouter = express.Router();

protectedRouter.get("/testprotection", authenticateToken, (req, res) => {
  res
    .status(200)
    .json({ message: `Welcome, ${req.user.username}!`, user: req.user });
});

export default protectedRouter;
