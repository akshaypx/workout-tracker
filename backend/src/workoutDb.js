import sqlite3 from "sqlite3";
import { open } from "sqlite";

async function initializeDatabase() {
  const db = await open({
    filename: "./workout.db",
    driver: sqlite3.Database,
  });

  await db.exec(
    `
        CREATE TABLE IF NOT EXISTS workouts(
        workout_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        exercise_id INTEGER,
        start_time TEXT,
        end_time TEXT
        )
        `
  );

  return db;
}

export default initializeDatabase;
