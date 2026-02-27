from dotenv import load_dotenv
load_dotenv()
from flask import Flask
from flask_cors import CORS
from .config import Config
from .models import db
import os


def create_app():
    app = Flask(__name__, static_folder="../frontend/dist", static_url_path="")
    app.config.from_object(Config)

    db.init_app(app)
    CORS(app)

    with app.app_context():
        db.create_all()

    from .routes.auth import auth_bp
    from .routes.plans import plans_bp
    from .routes.progress import progress_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(plans_bp, url_prefix="/api/plans")
    app.register_blueprint(progress_bp, url_prefix="/api/progress")

from flask import send_from_directory
import os

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")

    return app
