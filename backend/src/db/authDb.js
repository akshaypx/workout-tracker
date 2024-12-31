import { initializeDatabase } from "./index.js";

const initializeAuthTable = async () => {
  const db = await initializeDatabase();

  await db.exec(
    `
        CREATE TABLE IF NOT EXISTS Users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL
        )
    `
  );

  console.log("Users table initialized");
};

export default initializeAuthTable;
