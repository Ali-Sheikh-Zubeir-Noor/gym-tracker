# Fitness Tracker Backend

A Flask-based REST API backend for the Fitness Tracker application using SQLite database.

## Features

- **User Management**: Create, read, update user profiles
- **Exercise Library**: Full CRUD operations for exercises
- **Workout Management**: Create, track, and manage workouts
- **Progress Tracking**: Store workout completion data
- **SQLite Database**: Lightweight, file-based database
- **CORS Support**: Cross-origin requests enabled for frontend

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/<id>` - Get specific user
- `POST /api/users` - Create new user
- `PUT /api/users/<id>` - Update user

### Exercises
- `GET /api/exercises` - Get all exercises
- `GET /api/exercises/<id>` - Get specific exercise
- `POST /api/exercises` - Create new exercise
- `PUT /api/exercises/<id>` - Update exercise
- `DELETE /api/exercises/<id>` - Delete exercise

### Workouts
- `GET /api/workouts` - Get all workouts (optional ?user_id=<id>)
- `GET /api/workouts/<id>` - Get specific workout
- `POST /api/workouts` - Create new workout
- `PUT /api/workouts/<id>` - Update workout
- `DELETE /api/workouts/<id>` - Delete workout

### Workout Exercises
- `GET /api/workout-exercises/<workout_id>` - Get exercises for workout
- `POST /api/workout-exercises` - Add exercise to workout
- `PUT /api/workout-exercises/<id>` - Update workout exercise
- `DELETE /api/workout-exercises/<id>` - Remove exercise from workout

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
python app.py
```

The API will be available at `http://localhost:5000`

## Database Schema

### Users Table
- id (Primary Key)
- name, email, age, weight, height, goal
- created_at

### Exercises Table
- id (Primary Key)
- name, category, muscle_groups (JSON), equipment, instructions
- created_at

### Workouts Table
- id (Primary Key)
- user_id (Foreign Key), name, date, notes
- completed, completed_date, duration
- created_at

### Workout Exercises Table
- id (Primary Key)
- workout_id (Foreign Key), exercise_id (Foreign Key)
- sets, reps, weight, rest_time, notes
- created_at

## Sample Data

The application automatically creates sample data on first run:
- Sample user (John Doe)
- 8 common exercises (Push-ups, Squats, Pull-ups, etc.)