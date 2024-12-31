"https://roadmap.sh/projects/fitness-workout-tracker"

Datasets for Seeding Exercise data
https://www.kaggle.com/datasets/niharika41298/gym-exercise-data/data

Populate env with following

PORT = 8000
JWT_SECRET_KEY = your_jwt_secret_key
TOKEN_HEADER_KEY = your_token_header_key
JWT_EXPIRY=1h

TODOS-
[] Create Workout: Allow users to create workouts composed of multiple exercises.
[] Update Workout: Allow users to update workouts and add comments.
[] Delete Workout: Allow users to delete workouts.
[] Schedule Workouts: Allow users to schedule workouts for specific dates and times.
[] List Workouts: List active or pending workouts sorted by date and time.
[] Generate Reports: Generate reports on past workouts and progress.

```
node .\src\seedDB.js
```
