import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { initializeDatabase, initializeAllTables } from "./src/db/index.js";
import authRouter from "./src/routes/authRoute.js";
import protectedRouter from "./src/routes/protectedRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

let db;

(async () => {
  db = await initializeDatabase();
  db = await initializeAllTables();
})();

app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use(bodyParser.json());

app.use("/auth", authRouter);
app.use("/protected", protectedRouter);
app.get("/test", (req, res) => res.send("hello world"));

app.listen(PORT, () => console.log(`Server listening at ${PORT}`));
