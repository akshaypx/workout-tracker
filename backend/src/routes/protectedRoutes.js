import express from "express";
import authenticateToken from "../middlewares/authMiddleware.js";
import initializeWorkoutsDatabase from "../workoutDb.js";
import initializeWorkoutExercisesDatabase from "../workoutExercisesDb.js";

const protectedRouter = express.Router();

let workoutDb;
let workoutExercisesDb;

(async () => {
  workoutDb = await initializeWorkoutsDatabase();
  console.log("workoutDb initialized");
  workoutExercisesDb = await initializeWorkoutExercisesDatabase();
  console.log("workoutExercisesDb initialized");
})();

protectedRouter.get("/testprotection", authenticateToken, (req, res) => {
  res
    .status(200)
    .json({ message: `Welcome, ${req.user.username}!`, user: req.user });
});

// list all workouts
protectedRouter.get("/list-workouts", authenticateToken, async (req, res) => {
  try {
    const workouts = await workoutDb.all(
      `SELECT * 
      FROM workouts 
      WHERE user_id = ? AND status IN ('active', 'pending') 
      ORDER BY scheduled_date ASC`,
      [req.user.id]
    );
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
protectedRouter.post("/create-workout", authenticateToken, async (req, res) => {
  const { exercise_id, scheduled_date, name } = req.body;
  const user_id = req.user.id;

  if (!user_id || !exercise_id || !scheduled_date) {
    console.log(user_id, exercise_id, scheduled_date);
    return res
      .status(400)
      .json({ message: "Invalid request body, missing required fields." });
  }

  try {
    await workoutDb.run(
      `
      INSERT INTO workouts (user_id, name, status, scheduled_date) 
      VALUES (?, ?, 'pending', ?)
      `,
      [user_id, name, scheduled_date]
    );
    return res.status(201).json({ message: "Workout added successfully." });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Error adding workout." });
  }
});

//add exercises to a workout
protectedRouter.post("/add-exercises", authenticateToken, async (req, res) => {
  const { workout_id, exercise_id, sets, reps, weight, duration } = req.body;

  if (!workout_id || !exercise_id || !sets || !reps || !weight || !duration) {
    return res.status(400).json({
      message:
        "Invalid request body, missing required fields. [workout_id, exercise_id, sets, reps, weight, duration]",
    });
  }

  try {
    await workoutExercisesDb.run(
      `
      INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, duration) 
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [workout_id, exercise_id, sets, reps, weight, duration]
    );
    return res
      .status(201)
      .json({ message: "Workout Exercise added successfully." });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Error adding workout exercise." });
  }
});

//update a workout
protectedRouter.post("/update-workout", authenticateToken, async (req, res) => {
  const { workout_id, name, status, scheduled_date } = req.body;

  const user_id = req.user.id;

  if (!workout_id || !user_id) {
    return res.status(400).json({
      message: "Invalid request body, missing required fields.",
    });
  }

  try {
    const workout = workoutDb.all(
      `SELECT * 
      FROM workouts 
      WHERE workout_id = ? AND user_id = ?;
      `,
      [workout_id, user_id]
    );
    if (!workout) {
      return res.status(404).json({ message: "Workout does not exist." });
    }

    await workoutDb.run(
      `
      UPDATE workouts 
      SET name = ?, status = ?, scheduled_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE workout_id = ? AND user_id = ?
      `,
      [
        name || workout.name,
        status || workout.status,
        scheduled_date || workout.scheduled_date,
        workout_id,
        user_id,
      ]
    );
    return res.status(201).json({ message: "Workout Updated successfully." });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Error updating workout." });
  }
});

export default protectedRouter;
