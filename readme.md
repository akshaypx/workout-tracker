# Workout Tracker Database Schema

This README provides an explanation of the **ER Diagram** and schema for the Workout Tracker app. The schema is designed using a relational database approach and supports features such as user management, workout planning, exercise cataloging, scheduling, and progress tracking.

---

## **Entity-Relationship Diagram (ERD)**

### Key Entities and Relationships:

1. **Users**:

   - Represents registered users of the app.
   - Each user can have multiple workouts.

2. **Workouts**:

   - Represents a specific workout session or plan created by a user.
   - A workout can include multiple exercises.
   - Contains details like status (e.g., active, pending, completed) and scheduled date.

3. **Exercises**:

   - A catalog of predefined exercises (e.g., Squat, Deadlift).
   - Contains metadata such as type, body part, equipment, and difficulty level.

4. **Workout_Exercises**:
   - A junction table that maps exercises to workouts.
   - Tracks exercise-specific details like sets, reps, weight, and duration within a workout.

---

## **Database Tables**

### 1. **Users Table**

Stores user information.

```sql
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

- **Primary Key**: `user_id`
- Stores unique usernames and email addresses.

---

### 2. **Workouts Table**

Represents workout plans associated with a user.

```sql
CREATE TABLE IF NOT EXISTS workouts (
    workout_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    status TEXT CHECK(status IN ('active', 'pending', 'completed')) DEFAULT 'pending',
    scheduled_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

- **Primary Key**: `workout_id`
- **Foreign Key**: `user_id` references `users(user_id)`.
- Tracks the workout name, status, and scheduled date.

---

### 3. **Exercises Table**

A catalog of exercises.

```sql
CREATE TABLE IF NOT EXISTS exercises (
    exercise_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    desc TEXT,
    type TEXT,
    body_part TEXT,
    equipment TEXT,
    level TEXT
);
```

- **Primary Key**: `exercise_id`
- Stores exercise metadata (e.g., type, body part, and difficulty level).

---

### 4. **Workout_Exercises Table**

Maps workouts to exercises and tracks exercise-specific details.

```sql
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
);
```

- **Primary Key**: `workout_exercise_id`
- **Foreign Keys**:
  - `workout_id` references `workouts(workout_id)`.
  - `exercise_id` references `exercises(exercise_id)`.
- Tracks exercise details like sets, reps, weight, and duration within a workout.

---

## **Relationships in the ERD**

1. **Users (1) -> Workouts (N)**:

   - One user can create multiple workouts.

2. **Workouts (1) -> Workout_Exercises (N)**:

   - One workout can contain multiple exercises.

3. **Exercises (1) -> Workout_Exercises (N)**:

   - One exercise can appear in multiple workouts.

4. **Workout_Exercises (N)**:
   - Serves as a bridge between `Workouts` and `Exercises`.

---

## **Queries for Key Functionalities**

### 1. **Create Workout**

```sql
INSERT INTO workouts (user_id, name, status, scheduled_date)
VALUES (?, ?, 'pending', ?);
```

### 2. **Add Exercises to a Workout**

```sql
INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, duration)
VALUES (?, ?, ?, ?, ?, ?);
```

### 3. **Update Workout**

```sql
UPDATE workouts
SET name = ?, status = ?, scheduled_date = ?, updated_at = CURRENT_TIMESTAMP
WHERE workout_id = ? AND user_id = ?;
```

### 4. **Delete Workout**

```sql
DELETE FROM workouts
WHERE workout_id = ? AND user_id = ?;
```

### 5. **List Workouts**

```sql
SELECT *
FROM workouts
WHERE user_id = ? AND status IN ('active', 'pending')
ORDER BY scheduled_date ASC;
```

### 6. **Generate Reports**

#### Completed Workouts

```sql
SELECT w.workout_id, w.name, w.scheduled_date, w.created_at,
       COUNT(we.exercise_id) AS total_exercises,
       SUM(we.sets * we.reps) AS total_reps,
       SUM(we.weight * we.sets) AS total_weight,
       SUM(we.duration) AS total_duration
FROM workouts w
LEFT JOIN workout_exercises we ON w.workout_id = we.workout_id
WHERE w.user_id = ? AND w.status = 'completed'
GROUP BY w.workout_id
ORDER BY w.scheduled_date DESC;
```

#### Progress for a Specific Exercise

```sql
SELECT w.scheduled_date, we.sets, we.reps, we.weight, we.duration
FROM workout_exercises we
JOIN workouts w ON we.workout_id = w.workout_id
WHERE w.user_id = ? AND we.exercise_id = ?
ORDER BY w.scheduled_date ASC;
```

---

## **Additional Resources**

- **Project Roadmap**: [Fitness Workout Tracker](https://roadmap.sh/projects/fitness-workout-tracker)
- **Datasets for Seeding Exercise Data**: [Gym Exercise Data on Kaggle](https://www.kaggle.com/datasets/niharika41298/gym-exercise-data/data)

---

## **Environment Variables**

Ensure the following variables are set in your environment:

```
PORT = 8000
JWT_SECRET_KEY = your_jwt_secret_key
TOKEN_HEADER_KEY = your_token_header_key
JWT_EXPIRY = 1h
```

---

## **To-Do List**

- [x] **Create Workout**: Allow users to create workouts composed of multiple exercises.
- [x] **Update Workout**: Allow users to update workouts and add comments.
- [x] **Delete Workout**: Allow users to delete workouts.
- [x] **Schedule Workouts**: Allow users to schedule workouts for specific dates and times.
- [x] **List Workouts**: List active or pending workouts sorted by date and time.
- [x] **Generate Reports**: Generate reports on past workouts and progress.
- [ ] **Frontend Development**: Develop a Frontend for the backend APIs.
- [ ] **Testing**: Write tests for all the backend APIs.

---

## **Seeding the Database**

Run the following command to seed the database with exercise data:

```
node .\src\seedDB.js
```
