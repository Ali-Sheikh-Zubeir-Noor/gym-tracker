from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Database setup
DATABASE = 'gym_tracker.db'

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database with required tables"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
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
    
    # Exercises table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS exercises (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT,
            muscle_groups TEXT,
            equipment TEXT,
            instructions TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Workouts table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS workouts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT NOT NULL,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed BOOLEAN DEFAULT FALSE,
            completed_date TIMESTAMP,
            duration INTEGER,
            notes TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Workout_exercises table (many-to-many with additional attributes)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS workout_exercises (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workout_id INTEGER,
            exercise_id INTEGER,
            sets INTEGER NOT NULL,
            reps INTEGER NOT NULL,
            weight REAL,
            rest_time INTEGER,
            notes TEXT,
            order_in_workout INTEGER,
            FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE,
            FOREIGN KEY (exercise_id) REFERENCES exercises (id)
        )
    ''')
    
    # Insert default user if table is empty
    cursor.execute('SELECT COUNT(*) FROM users')
    if cursor.fetchone()[0] == 0:
        cursor.execute('''
            INSERT INTO users (name, email, age, weight, height, goal)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', ('John Doe', 'john@example.com', 25, 75, 180, 'Build Muscle'))
    
    # Insert default exercises if table is empty
    cursor.execute('SELECT COUNT(*) FROM exercises')
    if cursor.fetchone()[0] == 0:
        default_exercises = [
            ('Bench Press', 'Chest', '["Chest", "Triceps"]', 'Barbell', 'Lie on bench, lower bar to chest, press up'),
            ('Squats', 'Legs', '["Quadriceps", "Glutes"]', 'Barbell', 'Stand with feet shoulder-width apart, squat down, stand up'),
            ('Deadlift', 'Back', '["Back", "Hamstrings"]', 'Barbell', 'Lift bar from ground to hip level'),
            ('Pull-ups', 'Back', '["Lats", "Biceps"]', 'Pull-up Bar', 'Hang from bar, pull body up until chin over bar'),
            ('Overhead Press', 'Shoulders', '["Shoulders", "Triceps"]', 'Barbell', 'Press bar overhead from shoulder level'),
            ('Bicep Curls', 'Arms', '["Biceps"]', 'Dumbbells', 'Curl weights from extended arms to shoulders'),
            ('Push-ups', 'Chest', '["Chest", "Triceps"]', 'Bodyweight', 'Lower body to ground, push back up'),
            ('Lunges', 'Legs', '["Quadriceps", "Glutes"]', 'Bodyweight', 'Step forward into lunge position, return to start')
        ]
        
        cursor.executemany('''
            INSERT INTO exercises (name, category, muscle_groups, equipment, instructions)
            VALUES (?, ?, ?, ?, ?)
        ''', default_exercises)
    
    conn.commit()
    conn.close()

# API Routes

# Users routes
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
    if user:
        return jsonify(dict(user))
    return jsonify({'error': 'User not found'}), 404

@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json()
    
    # Validation
    if not data.get('name') or not data.get('email'):
        return jsonify({'error': 'Name and email are required'}), 400
    
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO users (name, email, age, weight, height, goal)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (data['name'], data['email'], data.get('age'), 
              data.get('weight'), data.get('height'), data.get('goal')))
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
    
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE users 
        SET name = ?, email = ?, age = ?, weight = ?, height = ?, goal = ?
        WHERE id = ?
    ''', (data['name'], data['email'], data.get('age'), 
          data.get('weight'), data.get('height'), data.get('goal'), user_id))
    
    conn.commit()
    conn.close()
    return jsonify({'message': 'User updated successfully'})

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM users WHERE id = ?', (user_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'User deleted successfully'})

# Exercises routes
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
    if exercise:
        return jsonify(dict(exercise))
    return jsonify({'error': 'Exercise not found'}), 404

@app.route('/api/exercises', methods=['POST'])
def create_exercise():
    data = request.get_json()
    
    # Validation
    if not data.get('name') or not data.get('category'):
        return jsonify({'error': 'Name and category are required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO exercises (name, category, muscle_groups, equipment, instructions)
        VALUES (?, ?, ?, ?, ?)
    ''', (data['name'], data['category'], json.dumps(data.get('muscle_groups', [])), 
          data.get('equipment'), data.get('instructions')))
    exercise_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return jsonify({'id': exercise_id, 'message': 'Exercise created successfully'}), 201

@app.route('/api/exercises/<int:exercise_id>', methods=['PUT'])
def update_exercise(exercise_id):
    data = request.get_json()
    conn = get_db_connection()
    
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE exercises 
        SET name = ?, category = ?, muscle_groups = ?, equipment = ?, instructions = ?
        WHERE id = ?
    ''', (data['name'], data['category'], json.dumps(data.get('muscle_groups', [])), 
          data.get('equipment'), data.get('instructions'), exercise_id))
    
    conn.commit()
    conn.close()
    return jsonify({'message': 'Exercise updated successfully'})

@app.route('/api/exercises/<int:exercise_id>', methods=['DELETE'])
def delete_exercise(exercise_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM exercises WHERE id = ?', (exercise_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Exercise deleted successfully'})

# Workouts routes
@app.route('/api/workouts', methods=['GET'])
def get_workouts():
    user_id = request.args.get('user_id')
    conn = get_db_connection()
    
    if user_id:
        workouts = conn.execute('''
            SELECT w.*, u.name as user_name 
            FROM workouts w 
            JOIN users u ON w.user_id = u.id 
            WHERE w.user_id = ? 
            ORDER BY w.date DESC
        ''', (user_id,)).fetchall()
    else:
        workouts = conn.execute('''
            SELECT w.*, u.name as user_name 
            FROM workouts w 
            JOIN users u ON w.user_id = u.id 
            ORDER BY w.date DESC
        ''').fetchall()
    
    # Get exercises for each workout
    workout_list = []
    for workout in workouts:
        workout_dict = dict(workout)
        exercises = conn.execute('''
            SELECT we.*, e.name, e.category, e.muscle_groups, e.equipment
            FROM workout_exercises we
            JOIN exercises e ON we.exercise_id = e.id
            WHERE we.workout_id = ?
            ORDER BY we.order_in_workout
        ''', (workout['id'],)).fetchall()
        workout_dict['exercises'] = [dict(ex) for ex in exercises]
        workout_list.append(workout_dict)
    
    conn.close()
    return jsonify(workout_list)

@app.route('/api/workouts/<int:workout_id>', methods=['GET'])
def get_workout(workout_id):
    conn = get_db_connection()
    workout = conn.execute('''
        SELECT w.*, u.name as user_name 
        FROM workouts w 
        JOIN users u ON w.user_id = u.id 
        WHERE w.id = ?
    ''', (workout_id,)).fetchone()
    
    if not workout:
        conn.close()
        return jsonify({'error': 'Workout not found'}), 404
    
    workout_dict = dict(workout)
    exercises = conn.execute('''
        SELECT we.*, e.name, e.category, e.muscle_groups, e.equipment
        FROM workout_exercises we
        JOIN exercises e ON we.exercise_id = e.id
        WHERE we.workout_id = ?
        ORDER BY we.order_in_workout
    ''', (workout_id,)).fetchall()
    workout_dict['exercises'] = [dict(ex) for ex in exercises]
    
    conn.close()
    return jsonify(workout_dict)

@app.route('/api/workouts', methods=['POST'])
def create_workout():
    data = request.get_json()
    
    # Validation
    if not data.get('name') or not data.get('user_id'):
        return jsonify({'error': 'Name and user_id are required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create workout
    cursor.execute('''
        INSERT INTO workouts (user_id, name, date, notes)
        VALUES (?, ?, ?, ?)
    ''', (data['user_id'], data['name'], 
          data.get('date', datetime.now().isoformat()), data.get('notes')))
    workout_id = cursor.lastrowid
    
    # Add exercises to workout
    if data.get('exercises'):
        for i, exercise in enumerate(data['exercises']):
            cursor.execute('''
                INSERT INTO workout_exercises 
                (workout_id, exercise_id, sets, reps, weight, rest_time, notes, order_in_workout)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (workout_id, exercise['exercise_id'], exercise['sets'], 
                  exercise['reps'], exercise.get('weight'), exercise.get('rest_time'),
                  exercise.get('notes'), i + 1))
    
    conn.commit()
    conn.close()
    return jsonify({'id': workout_id, 'message': 'Workout created successfully'}), 201

@app.route('/api/workouts/<int:workout_id>', methods=['PUT'])
def update_workout(workout_id):
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Update workout
    cursor.execute('''
        UPDATE workouts 
        SET name = ?, completed = ?, completed_date = ?, duration = ?, notes = ?
        WHERE id = ?
    ''', (data['name'], data.get('completed', False), 
          data.get('completed_date'), data.get('duration'), 
          data.get('notes'), workout_id))
    
    # Update exercises if provided
    if 'exercises' in data:
        # Delete existing exercises
        cursor.execute('DELETE FROM workout_exercises WHERE workout_id = ?', (workout_id,))
        
        # Add updated exercises
        for i, exercise in enumerate(data['exercises']):
            cursor.execute('''
                INSERT INTO workout_exercises 
                (workout_id, exercise_id, sets, reps, weight, rest_time, notes, order_in_workout)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (workout_id, exercise['exercise_id'], exercise['sets'], 
                  exercise['reps'], exercise.get('weight'), exercise.get('rest_time'),
                  exercise.get('notes'), i + 1))
    
    conn.commit()
    conn.close()
    return jsonify({'message': 'Workout updated successfully'})

@app.route('/api/workouts/<int:workout_id>', methods=['DELETE'])
def delete_workout(workout_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM workouts WHERE id = ?', (workout_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Workout deleted successfully'})

# Workout exercises routes
@app.route('/api/workout-exercises', methods=['POST'])
def add_exercise_to_workout():
    data = request.get_json()
    
    # Validation
    required_fields = ['workout_id', 'exercise_id', 'sets', 'reps']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'workout_id, exercise_id, sets, and reps are required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get the next order number
    cursor.execute('''
        SELECT COALESCE(MAX(order_in_workout), 0) + 1 
        FROM workout_exercises 
        WHERE workout_id = ?
    ''', (data['workout_id'],))
    order_num = cursor.fetchone()[0]
    
    cursor.execute('''
        INSERT INTO workout_exercises 
        (workout_id, exercise_id, sets, reps, weight, rest_time, notes, order_in_workout)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (data['workout_id'], data['exercise_id'], data['sets'], 
          data['reps'], data.get('weight'), data.get('rest_time'),
          data.get('notes'), order_num))
    
    exercise_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return jsonify({'id': exercise_id, 'message': 'Exercise added to workout successfully'}), 201

@app.route('/api/workout-exercises/<int:workout_exercise_id>', methods=['PUT'])
def update_workout_exercise(workout_exercise_id):
    data = request.get_json()
    conn = get_db_connection()
    
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE workout_exercises 
        SET sets = ?, reps = ?, weight = ?, rest_time = ?, notes = ?
        WHERE id = ?
    ''', (data['sets'], data['reps'], data.get('weight'), 
          data.get('rest_time'), data.get('notes'), workout_exercise_id))
    
    conn.commit()
    conn.close()
    return jsonify({'message': 'Workout exercise updated successfully'})

@app.route('/api/workout-exercises/<int:workout_exercise_id>', methods=['DELETE'])
def remove_exercise_from_workout(workout_exercise_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM workout_exercises WHERE id = ?', (workout_exercise_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Exercise removed from workout successfully'})

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)