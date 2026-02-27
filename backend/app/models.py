from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(120), unique=True, nullable=False)
    email = db.Column(db.String(200), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    plans = db.relationship("StudyPlan", backref="user", lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class StudyPlan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    subject = db.Column(db.String(200), nullable=False)
    level = db.Column(db.String(100), nullable=False)
    days = db.Column(db.Integer, nullable=False)
    hours_per_day = db.Column(db.Float, nullable=False)
    completion_percentage = db.Column(db.Float, default=0)
    plan_data = db.Column(db.JSON, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class UserProgress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    plan_id = db.Column(db.Integer, db.ForeignKey("study_plan.id"), nullable=False)
    day = db.Column(db.Integer, nullable=False)
    topic = db.Column(db.String(255), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    time_spent = db.Column(db.Float, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)
