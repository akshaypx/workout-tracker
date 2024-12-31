import fs from "fs";
import { parse } from "csv-parse";
import pkg from "sqlite3";

const { verbose } = pkg;
const sqlite3 = verbose();
const filepath = "./exercise.db";

function connectToDatabase() {
  if (fs.existsSync(filepath)) {
    return new sqlite3.Database(filepath);
  } else {
    const db = new sqlite3.Database(filepath, (error) => {
      if (error) {
        console.error("Database connection failed:", error.message);
        return;
      }
      console.log("Connected to the database successfully");
      createTable(db);
    });
    return db;
  }
}

function createTable(db) {
  db.run(
    `
    CREATE TABLE IF NOT EXISTS exercises (
      exercise_id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL,
      desc        TEXT,
      type        TEXT,
      body_part   TEXT,
      equipment   TEXT,
      level       TEXT
    )
  `,
    (error) => {
      if (error) {
        console.error("Failed to create table:", error.message);
      } else {
        console.log("Table created successfully (if it did not already exist)");
      }
    }
  );
}

const db = connectToDatabase();

fs.createReadStream("../backend/data/megaGymDataset.csv")
  .pipe(parse({ delimiter: ",", from_line: 2 })) // Parse the CSV file
  .on("data", function (row) {
    db.serialize(() => {
      db.run(
        `INSERT INTO exercises (title, desc, type, body_part, equipment, level) VALUES (?, ?, ?, ?, ?, ?)`,
        [row[0], row[1], row[2], row[3], row[4], row[5]],
        function (error) {
          if (error) {
            console.error("Error inserting row:", error.message);
          } else {
            console.log(`Inserted a row with ID: ${this.lastID}`);
          }
        }
      );
    });
  })
  .on("end", function () {
    console.log("CSV parsing and database insertion completed.");
  })
  .on("error", function (error) {
    console.error("Error reading CSV file:", error.message);
  });
