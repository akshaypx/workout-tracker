import { initializeDatabase } from "./index.js";

const initWorkoutTable = async () => {
  const db = await initializeDatabase();

  await db.exec(
    `
    CREATE TABLE IF NOT EXISTS workouts(
        workout_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        status TEXT CHECK(status IN ('active', 'pending', 'completed')) DEFAULT 'pending',
        scheduled_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )
    `
  );

  console.log("Workout table initialized.");
};
export default initWorkoutTable;
