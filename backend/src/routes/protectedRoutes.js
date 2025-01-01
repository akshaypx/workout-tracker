import express from "express";
import authenticateToken from "../middlewares/authMiddleware.js";

const protectedRouter = express.Router();

protectedRouter.get("/testprotection", authenticateToken, (req, res) => {
  res
    .status(200)
    .json({ message: `Welcome, ${req.user.username}!`, user: req.user });
});

// list all workouts
protectedRouter.get("/list-workouts", authenticateToken, async (req, res) => {
  let db = req.db;

  try {
    const workouts = await db.all(
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
  let db = req.db;

  const { exercise_id, scheduled_date, name } = req.body;
  const user_id = req.user.id;

  if (!user_id || !exercise_id || !scheduled_date) {
    console.log(user_id, exercise_id, scheduled_date);
    return res
      .status(400)
      .json({ message: "Invalid request body, missing required fields." });
  }

  try {
    await db.run(
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
  let db = req.db;

  const { workout_id, exercise_id, sets, reps, weight, duration } = req.body;

  if (!workout_id || !exercise_id || !sets || !reps || !weight || !duration) {
    return res.status(400).json({
      message:
        "Invalid request body, missing required fields. [workout_id, exercise_id, sets, reps, weight, duration]",
    });
  }

  try {
    await db.run(
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
  let db = req.db;

  const { workout_id, name, status, scheduled_date } = req.body;

  const user_id = req.user.id;

  if (!workout_id || !user_id) {
    return res.status(400).json({
      message: "Invalid request body, missing required fields.",
    });
  }

  try {
    const workout = db.all(
      `SELECT * 
      FROM workouts 
      WHERE workout_id = ? AND user_id = ?;
      `,
      [workout_id, user_id]
    );
    if (!workout) {
      return res.status(404).json({ message: "Workout does not exist." });
    }

    await db.run(
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

//update workout exercise
protectedRouter.post(
  "/update-workout-exercise",
  authenticateToken,
  async (req, res) => {
    let db = req.db;

    const { workout_exercise_id, sets, reps, weight, duration } = req.body;

    const user_id = req.user.id;

    if (!workout_exercise_id || !user_id) {
      return res.status(400).json({
        message: "Invalid request body, missing required fields.",
      });
    }

    try {
      const workoutExercise = db.all(
        `SELECT * 
      FROM workout_exercises 
      WHERE workout_exercise_id = ?
      `,
        [workout_exercise_id]
      );
      if (!workoutExercise) {
        return res
          .status(404)
          .json({ message: "Workout Exercise does not exist." });
      }

      await db.run(
        `
      UPDATE workout_exercises 
      SET sets = ?, reps = ?, weight = ?, duration = ? 
      WHERE workout_exercise_id = ?
      `,
        [
          sets || workoutExercise.sets,
          reps || workoutExercise.reps,
          weight || workoutExercise.weight,
          duration || workoutExercise,
          workout_exercise_id,
        ]
      );
      return res
        .status(201)
        .json({ message: "Workout Exercise Updated successfully." });
    } catch (err) {
      console.log(err);
      return res
        .status(400)
        .json({ message: "Error updating workout exercise." });
    }
  }
);

//delete workout
protectedRouter.post("/delete-workout", authenticateToken, async (req, res) => {
  let db = req.db;

  const { workout_id } = req.body;
  const user_id = req.user.id;

  if (!workout_id || !user_id) {
    return res.status(400).json({ message: "Invalid request." });
  }

  try {
    await db.run(
      `
        DELETE FROM workouts 
        WHERE workout_id = ? AND user_id = ?;
        `,
      [workout_id, user_id]
    );
    res.status(200).json({ message: "Workout deleted successfully." });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Error deleting workout." });
  }
});

//schedule workout
protectedRouter.post(
  "/schedule-workout",
  authenticateToken,
  async (req, res) => {
    let db = req.db;

    const { workout_id, scheduled_date } = req.body;
    const user_id = req.user.id;

    if (!workout_id || !user_id || !scheduled_date) {
      return res.status(400).json({ message: "Invalid request." });
    }

    try {
      await db.run(
        `
        UPDATE workouts 
        SET scheduled_date = ?
        WHERE workout_id = ? AND user_id = ?
        `,
        [scheduled_date, workout_id, user_id]
      );
      res.status(200).json({ message: "Workout scheduled successfully." });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ message: "Error scheduling workout." });
    }
  }
);

//get report completed workouts
protectedRouter.post(
  "/reports-completed-workouts",
  authenticateToken,
  async (req, res) => {
    let db = req.db;

    const user_id = req.user.id;

    if (!user_id) {
      return res.status(400).json({ message: "Invalid request." });
    }

    try {
      const report = await db.all(
        `
        SELECT w.workout_id, w.name, w.scheduled_date, w.created_at, 
              COUNT(we.exercise_id) AS total_exercises, 
              SUM(we.sets * we.reps) AS total_reps, 
              SUM(we.weight * we.sets) AS total_weight, 
              SUM(we.duration) AS total_duration
        FROM workouts w
        LEFT JOIN workout_exercises we ON w.workout_id = we.workout_id
        WHERE w.user_id = ? AND w.status = 'completed'
        GROUP BY w.workout_id
        ORDER BY w.scheduled_date DESC
        `,
        [user_id]
      );
      return res.status(200).json({ report });
    } catch (err) {
      console.log(err);
      return res
        .status(400)
        .json({ message: "Error generating completed workout report." });
    }
  }
);

//get progress for a specific exercise in workout
protectedRouter.post(
  "/progress-exercise-workout",
  authenticateToken,
  async (req, res) => {
    let db = req.db;

    const { exercise_id } = req.body;

    const user_id = req.user.id;

    if (!user_id || !exercise_id) {
      return res.status(400).json({ message: "Invalid request." });
    }

    try {
      const progress = await db.all(
        `
        SELECT w.scheduled_date, we.sets, we.reps, we.weight, we.duration
        FROM workout_exercises we
        JOIN workouts w ON we.workout_id = w.workout_id
        WHERE w.user_id = ? AND we.exercise_id = ?
        ORDER BY w.scheduled_date ASC
        `,
        [user_id, exercise_id]
      );
      return res.status(200).json({ progress });
    } catch (err) {
      console.log(err);
      return res
        .status(400)
        .json({ message: "Error generating progress of exercise in workout." });
    }
  }
);

export default protectedRouter;
