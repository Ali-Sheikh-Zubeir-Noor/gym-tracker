from app import create_app, db
from app.models import User, Workout, Exercise

app = create_app()

with app.app_context():
    db.drop_all()
    db.create_all()

    user1 = User(username="ali", email="ali@example.com")
    user1.set_password("123456")
    db.session.add(user1)
    db.session.commit()

    workout1 = Workout(title="Leg Day", user_id=user1.id)
    workout2 = Workout(title="Push Day", user_id=user1.id)
    db.session.add_all([workout1, workout2])
    db.session.commit()

    ex1 = Exercise(name="Squats", sets=4, reps=10, weight=100, workout_id=workout1.id)
    ex2 = Exercise(name="Leg Press", sets=3, reps=12, weight=150, workout_id=workout1.id)
    ex3 = Exercise(name="Bench Press", sets=4, reps=8, weight=80, workout_id=workout2.id)
    db.session.add_all([ex1, ex2, ex3])
    db.session.commit()

    print("✅ Database seeded.")