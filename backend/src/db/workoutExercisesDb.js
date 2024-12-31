import { initializeDatabase } from "./index.js";

const initWorkoutExerciseTable = async () => {
  const db = await initializeDatabase();

  await db.exec(
    `
    CREATE TABLE IF NOT EXISTS workout_exercises (
            workout_exercise_id INTEGER PRIMARY KEY AUTOINCREMENT,
            workout_id INTEGER NOT NULL,
            exercise_id INTEGER NOT NULL,
            sets INTEGER NOT NULL,
            reps INTEGER NOT NULL,
            weight REAL DEFAULT NULL, 
            duration INTEGER DEFAULT NULL, 
            FOREIGN KEY (workout_id) REFERENCES workouts(workout_id) ON DELETE CASCADE,
            FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id) ON DELETE CASCADE
        )
    `
  );

  console.log("Workout Exercise table initialized");
};

export default initWorkoutExerciseTable;
