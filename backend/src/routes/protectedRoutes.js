import express from "express";
import authenticateToken from "../middlewares/authMiddleware.js";
import initializeDatabase from "../workoutDb.js";

const protectedRouter = express.Router();

let db;

(async () => {
  db = await initializeDatabase();
  console.log("Workout Db initialized");
})();

protectedRouter.get("/testprotection", authenticateToken, (req, res) => {
  res
    .status(200)
    .json({ message: `Welcome, ${req.user.username}!`, user: req.user });
});

// list all workouts
protectedRouter.get("/workout", authenticateToken, async (req, res) => {
  try {
    const workouts = await db.all(`SELECT * FROM workouts WHERE user_id= ?`, [
      req.user.id,
    ]);
    if (workouts) {
      return res.status(200).json({ workouts });
    } else {
      return res.status(404).json({ message: "No workouts found." });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

// create a workout
protectedRouter.post("/workout", authenticateToken, async (req, res) => {
  const { exercise_id, start_time, end_time } = req.body;
  const user_id = req.user.id;

  if (!user_id || !exercise_id || !start_time) {
    return res
      .status(400)
      .json({ message: "Invalid request body, missing required fields." });
  }

  try {
    await db.run(
      `
      INSERT INTO workouts (user_id, exercise_id, start_time, end_time) VALUES (?,?,?,?)
      `,
      [user_id, exercise_id, start_time, end_time]
    );
    return res.status(201).json({ message: "Workout added successfully." });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Error adding workout." });
  }
});

export default protectedRouter;
