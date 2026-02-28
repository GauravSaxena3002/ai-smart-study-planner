from flask import Blueprint, request, jsonify
from ..models import db, StudyPlan
from .auth import token_required
from ..services.ai_service import generate_study_plan

plans_bp = Blueprint("plans", __name__)


@plans_bp.route("/generate", methods=["POST"])
@token_required
def generate(current_user_id):
    try:
        data = request.json

        subject = data["subject"]
        level = data["level"]
        days = int(data["days"])
        hours = float(data["hours"])

        plan_data = generate_study_plan(subject, level, days, hours)

        plan = StudyPlan(
            subject=subject,
            level=level,
            days=days,
            hours_per_day=hours,
            plan_data=plan_data,
            completion_percentage=0,
            user_id=current_user_id,
        )

        db.session.add(plan)
        db.session.commit()

        return jsonify({
            "message": "Plan generated successfully",
            "plan": plan_data
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@plans_bp.route("/", methods=["GET"])
@token_required
def get_all_plans(current_user_id):
    plans = StudyPlan.query.filter_by(user_id=current_user_id).all()

    return jsonify([
        {
            "id": p.id,
            "subject": p.subject,
            "level": p.level,
            "days": p.days,
            "completion_percentage": p.completion_percentage,
            "plan_data": p.plan_data,
            "created_at": p.created_at.isoformat(),
        }
        for p in plans
    ])

@plans_bp.route("/<int:plan_id>/toggle", methods=["POST"])
@token_required
def toggle_topic(current_user_id, plan_id):
    data = request.json
    day_index = data["day_index"]
    topic_index = data["topic_index"]

    plan = StudyPlan.query.filter_by(
        id=plan_id, user_id=current_user_id
    ).first()

    if not plan:
        return jsonify({"error": "Plan not found"}), 404

    plan.plan_data[day_index]["topics"][topic_index]["completed"] = \
        not plan.plan_data[day_index]["topics"][topic_index]["completed"]

    # Recalculate completion
    total = 0
    completed = 0

    for day in plan.plan_data:
        for topic in day["topics"]:
            total += 1
            if topic["completed"]:
                completed += 1

    plan.completion_percentage = (completed / total) * 100 if total > 0 else 0

    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(plan, "plan_data")

    db.session.commit()

    return jsonify({
        "completion_percentage": plan.completion_percentage,
        "plan_data": plan.plan_data
    })
@plans_bp.route("/<int:plan_id>", methods=["DELETE"])
@token_required
def delete_plan(current_user_id, plan_id):
    plan = StudyPlan.query.filter_by(
        id=plan_id,
        user_id=current_user_id
    ).first()

    if not plan:
        return jsonify({"error": "Plan not found"}), 404

    db.session.delete(plan)
    db.session.commit()

    return jsonify({"message": "Plan deleted"})
