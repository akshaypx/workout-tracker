import sqlite3 from "sqlite3";
import { open } from "sqlite";
import initializeAuthTable from "./authDb.js";
import initializeWorkoutTable from "./workoutDb.js";
import initializeWorkoutExercisesTable from "./workoutExercisesDb.js";

let db; // Shared database instance

// Initialize the shared database connection
const initializeDatabase = async () => {
  if (!db) {
    db = await open({
      filename: "./exercise.db",
      driver: sqlite3.Database,
    });
    console.log("Database connection initialized");
  }
  return db;
};

// Initialize all tables
const initializeAllTables = async () => {
  const db = await initializeDatabase();

  // Initialize each table
  await initializeAuthTable();
  await initializeWorkoutTable();
  await initializeWorkoutExercisesTable();

  console.log("All tables initialized");
  return db;
};

export { initializeDatabase, initializeAllTables };
