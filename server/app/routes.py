from flask import Blueprint, request, jsonify
from app.models import db, User, Workout, Exercise
from functools import wraps
import jwt, os, datetime

api_bp = Blueprint("api", __name__)
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key")

# ---------- HELPER ----------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization", None)
        if token:
            try:
                token = token.split()[1]  # Remove "Bearer"
                data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
                current_user = User.query.get(data["user_id"])
                if not current_user:
                    return jsonify({"error": "User not found"}), 401
            except Exception as e:
                return jsonify({"error": "Invalid token"}), 401
            return f(current_user, *args, **kwargs)
        else:
            return jsonify({"error": "Missing token"}), 401
    return decorated

# ---------- AUTH ----------
@api_bp.route("/auth/signup", methods=["POST"])
def signup():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"error": "User already exists"}), 400

    new_user = User(username=username, email=email)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    token = jwt.encode(
        {"user_id": new_user.id, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)},
        SECRET_KEY,
        algorithm="HS256"
    )

    return jsonify({"user": {"id": new_user.id, "username": new_user.username}, "token": token}), 201

@api_bp.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        token = jwt.encode(
            {"user_id": user.id, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)},
            SECRET_KEY,
            algorithm="HS256"
        )
        return jsonify({"user": {"id": user.id, "username": user.username}, "token": token}), 200

    return jsonify({"error": "Invalid credentials"}), 401

# ---------- WORKOUTS ----------
@api_bp.route("/workouts", methods=["GET"])
@token_required
def get_workouts(current_user):
    workouts = Workout.query.filter_by(user_id=current_user.id).all()
    return jsonify([{
        "id": w.id,
        "title": w.title,
        "date": w.date.isoformat(),
        "exercises": [{
            "id": e.id,
            "name": e.name,
            "sets": e.sets,
            "reps": e.reps,
            "weight": e.weight
        } for e in w.exercises]
    } for w in workouts]), 200

@api_bp.route("/workouts", methods=["POST"])
@token_required
def create_workout(current_user):
    data = request.get_json()
    title = data.get("title")

    new_workout = Workout(title=title, user_id=current_user.id)
    db.session.add(new_workout)
    db.session.commit()

    return jsonify({"id": new_workout.id, "title": new_workout.title}), 201

@api_bp.route("/workouts/<int:id>", methods=["DELETE"])
@token_required
def delete_workout(current_user, id):
    workout = Workout.query.get(id)
    if not workout or workout.user_id != current_user.id:
        return jsonify({"error": "Workout not found"}), 404
    db.session.delete(workout)
    db.session.commit()
    return jsonify({"message": "Workout deleted"}), 200

# ---------- EXERCISES ----------
@api_bp.route("/exercises", methods=["POST"])
@token_required
def add_exercise(current_user):
    data = request.get_json()
    workout_id = data.get("workout_id")
    workout = Workout.query.get(workout_id)

    if not workout or workout.user_id != current_user.id:
        return jsonify({"error": "Unauthorized or workout not found"}), 403

    new_exercise = Exercise(
        name=data.get("name"),
        sets=data.get("sets"),
        reps=data.get("reps"),
        weight=data.get("weight"),
        workout_id=workout_id
    )
    db.session.add(new_exercise)
    db.session.commit()

    return jsonify({"id": new_exercise.id, "name": new_exercise.name}), 201

@api_bp.route("/exercises/<int:id>", methods=["DELETE"])
@token_required
def delete_exercise(current_user, id):
    exercise = Exercise.query.get(id)
    if not exercise or exercise.workout.user_id != current_user.id:
        return jsonify({"error": "Exercise not found or unauthorized"}), 404
    db.session.delete(exercise)
    db.session.commit()
    return jsonify({"message": "Exercise deleted"}), 200

# ---------- DASHBOARD ----------
@api_bp.route("/dashboard/summary", methods=["GET"])
@token_required
def dashboard_summary(current_user):
    workouts = Workout.query.filter_by(user_id=current_user.id).all()

    total_workouts = len(workouts)
    total_exercises = sum(len(w.exercises) for w in workouts)
    total_volume = sum(
        e.weight * e.reps * e.sets
        for w in workouts
        for e in w.exercises
        if e.weight
    )

    return jsonify({
        "total_workouts": total_workouts,
        "total_exercises": total_exercises,
        "total_volume": total_volume
    }), 200
