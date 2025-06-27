from . import db, bcrypt
from sqlalchemy.orm import validates
from datetime import datetime, timedelta
import jwt
import os

SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key")  # fallback for local dev

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    _password_hash = db.Column(db.String(128), nullable=False)

    workouts = db.relationship("Workout", backref="user", cascade="all, delete-orphan")

    def set_password(self, password):
        self._password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self._password_hash, password)

    def generate_token(self):
        payload = {
            "user_id": self.id,
            "exp": datetime.utcnow() + timedelta(hours=24)
        }
        return jwt.encode(payload, SECRET_KEY, algorithm='HS256')


class Workout(db.Model):
    __tablename__ = "workouts"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    exercises = db.relationship("Exercise", backref="workout", cascade="all, delete-orphan")


class Exercise(db.Model):
    __tablename__ = "exercises"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    sets = db.Column(db.Integer, nullable=False)
    reps = db.Column(db.Integer, nullable=False)
    weight = db.Column(db.Float)
    workout_id = db.Column(db.Integer, db.ForeignKey('workouts.id'), nullable=False)

    @validates('sets', 'reps')
    def validate_positive_int(self, key, value):
        if not isinstance(value, int) or value < 0:
            raise ValueError(f"{key} must be a positive integer")
        return value

    @validates('weight')
    def validate_weight(self, key, value):
        if value is not None and value < 0:
            raise ValueError("Weight must be non-negative")
        return value
