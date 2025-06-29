from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Database configuration
DATABASE = 'fitness_tracker.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    
    # Create users table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            age INTEGER,
            weight REAL,
            height REAL,
            goal TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create exercises table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS exercises (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            muscle_groups TEXT,
            equipment TEXT,
            instructions TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create workouts table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS workouts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            date DATE NOT NULL,
            notes TEXT,
            completed BOOLEAN DEFAULT FALSE,
            completed_date TIMESTAMP,
            duration INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create workout_exercises table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS workout_exercises (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workout_id INTEGER NOT NULL,
            exercise_id INTEGER NOT NULL,
            sets INTEGER NOT NULL,
            reps INTEGER NOT NULL,
            weight REAL DEFAULT 0,
            rest_time INTEGER DEFAULT 60,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE,
            FOREIGN KEY (exercise_id) REFERENCES exercises (id)
        )
    ''')
    
    # Insert sample data if tables are empty
    user_count = conn.execute('SELECT COUNT(*) FROM users').fetchone()[0]
    if user_count == 0:
        # Insert sample user
        conn.execute('''
            INSERT INTO users (name, email, age, weight, height, goal)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', ('John Doe', 'john@example.com', 28, 75.5, 180, 'Build Muscle'))
        
        # Insert sample exercises
        sample_exercises = [
            ('Push-ups', 'Chest', '["Chest", "Triceps", "Shoulders"]', 'Bodyweight', 'Start in plank position, lower body to ground, push back up'),
            ('Squats', 'Legs', '["Quadriceps", "Glutes", "Hamstrings"]', 'Bodyweight', 'Stand with feet shoulder-width apart, lower hips back and down, return to standing'),
            ('Pull-ups', 'Back', '["Back", "Biceps"]', 'Pull-up bar', 'Hang from bar, pull body up until chin clears bar, lower with control'),
            ('Bench Press', 'Chest', '["Chest", "Triceps", "Shoulders"]', 'Barbell', 'Lie on bench, lower bar to chest, press up to full extension'),
            ('Deadlift', 'Back', '["Back", "Glutes", "Hamstrings"]', 'Barbell', 'Stand with bar over feet, hinge at hips, lift bar by extending hips and knees'),
            ('Shoulder Press', 'Shoulders', '["Shoulders", "Triceps"]', 'Dumbbells', 'Press weights overhead from shoulder height, lower with control'),
            ('Plank', 'Core', '["Abs", "Obliques"]', 'Bodyweight', 'Hold body in straight line from head to heels, engage core muscles'),
            ('Lunges', 'Legs', '["Quadriceps", "Glutes", "Hamstrings"]', 'Bodyweight', 'Step forward into lunge position, return to standing, alternate legs')
        ]
        
        for exercise in sample_exercises:
            conn.execute('''
                INSERT INTO exercises (name, category, muscle_groups, equipment, instructions)
                VALUES (?, ?, ?, ?, ?)
            ''', exercise)
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# User endpoints
@app.route('/api/users', methods=['GET'])
def get_users():
    conn = get_db_connection()
    users = conn.execute('SELECT * FROM users').fetchall()
    conn.close()
    return jsonify([dict(user) for user in users])

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    conn.close()
    
    if user is None:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(dict(user))

@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json()
    
    required_fields = ['name', 'email']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    try:
        cursor = conn.execute('''
            INSERT INTO users (name, email, age, weight, height, goal)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            data['name'],
            data['email'],
            data.get('age'),
            data.get('weight'),
            data.get('height'),
            data.get('goal')
        ))
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({'id': user_id, 'message': 'User created successfully'}), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Email already exists'}), 400

@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.get_json()
    
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    
    if user is None:
        conn.close()
        return jsonify({'error': 'User not found'}), 404
    
    try:
        conn.execute('''
            UPDATE users 
            SET name = ?, email = ?, age = ?, weight = ?, height = ?, goal = ?
            WHERE id = ?
        ''', (
            data.get('name', user['name']),
            data.get('email', user['email']),
            data.get('age', user['age']),
            data.get('weight', user['weight']),
            data.get('height', user['height']),
            data.get('goal', user['goal']),
            user_id
        ))
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'User updated successfully'})
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Email already exists'}), 400

# Exercise endpoints
@app.route('/api/exercises', methods=['GET'])
def get_exercises():
    conn = get_db_connection()
    exercises = conn.execute('SELECT * FROM exercises ORDER BY name').fetchall()
    conn.close()
    return jsonify([dict(exercise) for exercise in exercises])

@app.route('/api/exercises/<int:exercise_id>', methods=['GET'])
def get_exercise(exercise_id):
    conn = get_db_connection()
    exercise = conn.execute('SELECT * FROM exercises WHERE id = ?', (exercise_id,)).fetchone()
    conn.close()
    
    if exercise is None:
        return jsonify({'error': 'Exercise not found'}), 404
    
    return jsonify(dict(exercise))

@app.route('/api/exercises', methods=['POST'])
def create_exercise():
    data = request.get_json()
    
    required_fields = ['name', 'category']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    cursor = conn.execute('''
        INSERT INTO exercises (name, category, muscle_groups, equipment, instructions)
        VALUES (?, ?, ?, ?, ?)
    ''', (
        data['name'],
        data['category'],
        data.get('muscle_groups', '[]'),
        data.get('equipment', ''),
        data.get('instructions', '')
    ))
    exercise_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({'id': exercise_id, 'message': 'Exercise created successfully'}), 201

@app.route('/api/exercises/<int:exercise_id>', methods=['PUT'])
def update_exercise(exercise_id):
    data = request.get_json()
    
    conn = get_db_connection()
    exercise = conn.execute('SELECT * FROM exercises WHERE id = ?', (exercise_id,)).fetchone()
    
    if exercise is None:
        conn.close()
        return jsonify({'error': 'Exercise not found'}), 404
    
    conn.execute('''
        UPDATE exercises 
        SET name = ?, category = ?, muscle_groups = ?, equipment = ?, instructions = ?
        WHERE id = ?
    ''', (
        data.get('name', exercise['name']),
        data.get('category', exercise['category']),
        data.get('muscle_groups', exercise['muscle_groups']),
        data.get('equipment', exercise['equipment']),
        data.get('instructions', exercise['instructions']),
        exercise_id
    ))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Exercise updated successfully'})

@app.route('/api/exercises/<int:exercise_id>', methods=['DELETE'])
def delete_exercise(exercise_id):
    conn = get_db_connection()
    exercise = conn.execute('SELECT * FROM exercises WHERE id = ?', (exercise_id,)).fetchone()
    
    if exercise is None:
        conn.close()
        return jsonify({'error': 'Exercise not found'}), 404
    
    conn.execute('DELETE FROM exercises WHERE id = ?', (exercise_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Exercise deleted successfully'})

# Workout endpoints
@app.route('/api/workouts', methods=['GET'])
def get_workouts():
    user_id = request.args.get('user_id')
    
    conn = get_db_connection()
    if user_id:
        workouts = conn.execute('''
            SELECT * FROM workouts 
            WHERE user_id = ? 
            ORDER BY date DESC
        ''', (user_id,)).fetchall()
    else:
        workouts = conn.execute('SELECT * FROM workouts ORDER BY date DESC').fetchall()
    
    # Get exercises for each workout
    workout_list = []
    for workout in workouts:
        workout_dict = dict(workout)
        
        # Get workout exercises
        exercises = conn.execute('''
            SELECT we.*, e.name as exercise_name
            FROM workout_exercises we
            JOIN exercises e ON we.exercise_id = e.id
            WHERE we.workout_id = ?
        ''', (workout['id'],)).fetchall()
        
        workout_dict['exercises'] = [
            {
                'id': ex['id'],
                'exercise_id': ex['exercise_id'],
                'name': ex['exercise_name'],
                'sets': ex['sets'],
                'reps': ex['reps'],
                'weight': ex['weight'],
                'rest_time': ex['rest_time'],
                'notes': ex['notes']
            }
            for ex in exercises
        ]
        
        workout_list.append(workout_dict)
    
    conn.close()
    return jsonify(workout_list)

@app.route('/api/workouts/<int:workout_id>', methods=['GET'])
def get_workout(workout_id):
    conn = get_db_connection()
    workout = conn.execute('SELECT * FROM workouts WHERE id = ?', (workout_id,)).fetchone()
    
    if workout is None:
        conn.close()
        return jsonify({'error': 'Workout not found'}), 404
    
    # Get workout exercises
    exercises = conn.execute('''
        SELECT we.*, e.name as exercise_name
        FROM workout_exercises we
        JOIN exercises e ON we.exercise_id = e.id
        WHERE we.workout_id = ?
    ''', (workout_id,)).fetchall()
    
    workout_dict = dict(workout)
    workout_dict['exercises'] = [
        {
            'id': ex['id'],
            'exercise_id': ex['exercise_id'],
            'name': ex['exercise_name'],
            'sets': ex['sets'],
            'reps': ex['reps'],
            'weight': ex['weight'],
            'rest_time': ex['rest_time'],
            'notes': ex['notes']
        }
        for ex in exercises
    ]
    
    conn.close()
    return jsonify(workout_dict)

@app.route('/api/workouts', methods=['POST'])
def create_workout():
    data = request.get_json()
    
    required_fields = ['user_id', 'name', 'date']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    
    # Create workout
    cursor = conn.execute('''
        INSERT INTO workouts (user_id, name, date, notes, completed, duration)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        data['user_id'],
        data['name'],
        data['date'],
        data.get('notes', ''),
        data.get('completed', False),
        data.get('duration')
    ))
    workout_id = cursor.lastrowid
    
    # Add exercises to workout
    if 'exercises' in data:
        for exercise in data['exercises']:
            conn.execute('''
                INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                workout_id,
                exercise['exercise_id'],
                exercise['sets'],
                exercise['reps'],
                exercise.get('weight', 0),
                exercise.get('rest_time', 60),
                exercise.get('notes', '')
            ))
    
    conn.commit()
    conn.close()
    
    return jsonify({'id': workout_id, 'message': 'Workout created successfully'}), 201

@app.route('/api/workouts/<int:workout_id>', methods=['PUT'])
def update_workout(workout_id):
    data = request.get_json()
    
    conn = get_db_connection()
    workout = conn.execute('SELECT * FROM workouts WHERE id = ?', (workout_id,)).fetchone()
    
    if workout is None:
        conn.close()
        return jsonify({'error': 'Workout not found'}), 404
    
    # Update workout
    conn.execute('''
        UPDATE workouts 
        SET name = ?, date = ?, notes = ?, completed = ?, completed_date = ?, duration = ?
        WHERE id = ?
    ''', (
        data.get('name', workout['name']),
        data.get('date', workout['date']),
        data.get('notes', workout['notes']),
        data.get('completed', workout['completed']),
        data.get('completed_date', workout['completed_date']),
        data.get('duration', workout['duration']),
        workout_id
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Workout updated successfully'})

@app.route('/api/workouts/<int:workout_id>', methods=['DELETE'])
def delete_workout(workout_id):
    conn = get_db_connection()
    workout = conn.execute('SELECT * FROM workouts WHERE id = ?', (workout_id,)).fetchone()
    
    if workout is None:
        conn.close()
        return jsonify({'error': 'Workout not found'}), 404
    
    # Delete workout (workout_exercises will be deleted due to CASCADE)
    conn.execute('DELETE FROM workouts WHERE id = ?', (workout_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Workout deleted successfully'})

# Workout Exercise endpoints
@app.route('/api/workout-exercises/<int:workout_id>', methods=['GET'])
def get_workout_exercises(workout_id):
    conn = get_db_connection()
    exercises = conn.execute('''
        SELECT we.*, e.name as exercise_name
        FROM workout_exercises we
        JOIN exercises e ON we.exercise_id = e.id
        WHERE we.workout_id = ?
    ''', (workout_id,)).fetchall()
    conn.close()
    
    return jsonify([
        {
            'id': ex['id'],
            'workout_id': ex['workout_id'],
            'exercise_id': ex['exercise_id'],
            'name': ex['exercise_name'],
            'sets': ex['sets'],
            'reps': ex['reps'],
            'weight': ex['weight'],
            'rest_time': ex['rest_time'],
            'notes': ex['notes']
        }
        for ex in exercises
    ])

@app.route('/api/workout-exercises', methods=['POST'])
def create_workout_exercise():
    data = request.get_json()
    
    required_fields = ['workout_id', 'exercise_id', 'sets', 'reps']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    cursor = conn.execute('''
        INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_time, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['workout_id'],
        data['exercise_id'],
        data['sets'],
        data['reps'],
        data.get('weight', 0),
        data.get('rest_time', 60),
        data.get('notes', '')
    ))
    exercise_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({'id': exercise_id, 'message': 'Workout exercise created successfully'}), 201

@app.route('/api/workout-exercises/<int:exercise_id>', methods=['PUT'])
def update_workout_exercise(exercise_id):
    data = request.get_json()
    
    conn = get_db_connection()
    exercise = conn.execute('SELECT * FROM workout_exercises WHERE id = ?', (exercise_id,)).fetchone()
    
    if exercise is None:
        conn.close()
        return jsonify({'error': 'Workout exercise not found'}), 404
    
    conn.execute('''
        UPDATE workout_exercises 
        SET sets = ?, reps = ?, weight = ?, rest_time = ?, notes = ?
        WHERE id = ?
    ''', (
        data.get('sets', exercise['sets']),
        data.get('reps', exercise['reps']),
        data.get('weight', exercise['weight']),
        data.get('rest_time', exercise['rest_time']),
        data.get('notes', exercise['notes']),
        exercise_id
    ))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Workout exercise updated successfully'})

@app.route('/api/workout-exercises/<int:exercise_id>', methods=['DELETE'])
def delete_workout_exercise(exercise_id):
    conn = get_db_connection()
    exercise = conn.execute('SELECT * FROM workout_exercises WHERE id = ?', (exercise_id,)).fetchone()
    
    if exercise is None:
        conn.close()
        return jsonify({'error': 'Workout exercise not found'}), 404
    
    conn.execute('DELETE FROM workout_exercises WHERE id = ?', (exercise_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Workout exercise deleted successfully'})

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Fitness Tracker API is running'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)