from flask import Blueprint, jsonify

progress_bp = Blueprint("progress", __name__)

@progress_bp.route("/", methods=["GET"])
def test_progress():
    return jsonify({"message": "Progress route working"})
