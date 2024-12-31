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
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        status TEXT CHECK(status IN ('active', 'pending', 'completed')) DEFAULT 'pending',
        scheduled_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )
        `
  );

  return db;
}

export default initializeDatabase;
