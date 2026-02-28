import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

from .models import db


load_dotenv()


def create_app():
    app = Flask(
        __name__,
        static_folder="../../frontend/dist",
        static_url_path=""
    )

    # ==============================
    # CONFIGURATION
    # ==============================
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret")
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # ==============================
    # INIT EXTENSIONS
    # ==============================
    db.init_app(app)
    CORS(app)

    # ==============================
    # REGISTER BLUEPRINTS
    # ==============================
    from .routes.auth import auth_bp
    from .routes.plans import plans_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(plans_bp, url_prefix="/api/plans")

    # ==============================
    # CREATE DATABASE
    # ==============================
    with app.app_context():
        db.create_all()

    # ==============================
    # SERVE REACT FRONTEND
    # ==============================
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, "index.html")

    return app
