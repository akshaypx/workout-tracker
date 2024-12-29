import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import initializeDatabase from "./src/authDb.js";
import authRouter from "./src/routes/authRoute.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

let db;

app.use(bodyParser.json());

app.use("/auth", authRouter);
app.get("/test", (req, res) => res.send("hello world"));

app.listen(PORT, () => console.log(`Server listening at ${PORT}`));
