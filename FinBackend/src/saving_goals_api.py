from flask import Blueprint, request, jsonify
from firebase_admin_setup import verify_token
from bson import ObjectId

from db import goals_collection

saving_goals_bp = Blueprint("saving_goals", __name__)

# -------------------------------
# Get Firebase User ID  
# -------------------------------
def get_user_id():
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None

    token = auth_header.replace("Bearer ", "")
    decoded = verify_token(token)

    if not decoded:
        return None

    return decoded.get("uid")

# -------------------------------
# Save Goal
# -------------------------------
@saving_goals_bp.route("/save_goal", methods=["POST"])
def save_goal():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    new_goal = request.json
    new_goal["user_id"] = user_id
    new_goal["status"] = "Pending"

    result = goals_collection.insert_one(new_goal)

    return jsonify({"message": "Goal saved successfully", "goal_id": str(result.inserted_id)})


# -------------------------------
# Get Goals
# -------------------------------
@saving_goals_bp.route("/get_goals", methods=["GET"])
def get_goals():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    goals = list(goals_collection.find({"user_id": user_id}))

    for g in goals:
        g["_id"] = str(g["_id"])

    return jsonify({"goals": goals})


# -------------------------------
# Delete Goal
# -------------------------------
@saving_goals_bp.route("/delete_goal", methods=["POST"])
def delete_goal():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    goal_name = request.json.get("name")

    goals_collection.delete_one({"user_id": user_id, "name": goal_name})

    return jsonify({"message": "Goal deleted"})


# -------------------------------
# Mark Completed
# -------------------------------
@saving_goals_bp.route("/complete_goal", methods=["POST"])
def complete_goal():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    goal_name = request.json.get("name")

    goals_collection.update_one(
        {"user_id": user_id, "name": goal_name},
        {"$set": {"status": "Completed"}}
    )

    return jsonify({"message": "Goal marked as completed"})
