from flask import Blueprint, request, jsonify
from app.models import db, User
import jwt
import os
from datetime import datetime, timedelta
from functools import wraps
from flask import current_app

auth_bp = Blueprint("auth", __name__)


def generate_token(user_id):
    token = jwt.encode(
        {
            "user_id": user_id,
            "exp": datetime.utcnow() + timedelta(days=7),
        },
        current_app.config["SECRET_KEY"],
        algorithm="HS256",
    )
    return token


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")

        if not token:
            return jsonify({"error": "Token missing"}), 401

        try:
            token = token.split(" ")[1]
            data = jwt.decode(
                token,
                current_app.config["SECRET_KEY"],
                algorithms=["HS256"],
            )
            current_user_id = data["user_id"]
        except Exception:
            return jsonify({"error": "Invalid or expired token"}), 401

        return f(current_user_id, *args, **kwargs)

    return decorated


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json

    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username already exists"}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 400

    user = User(
        username=data["username"],
        email=data["email"],
    )
    user.set_password(data["password"])

    db.session.add(user)
    db.session.commit()

    token = generate_token(user.id)

    return jsonify({
        "message": "User registered",
        "token": token
    })


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    user = User.query.filter_by(username=data["username"]).first()

    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    token = generate_token(user.id)

    return jsonify({
        "message": "Login successful",
        "token": token
    })
