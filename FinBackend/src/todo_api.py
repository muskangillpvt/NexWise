# todo_api.py
from flask import Blueprint, request, jsonify
from bson import ObjectId
from db import tasks_collection
from datetime import datetime

todo_api = Blueprint("todo_api", __name__)

def serialize_task(task):
    return {
        "id": str(task["_id"]),
        "user_id": task.get("user_id"),
        "title": task.get("title"),
        "description": task.get("description"),
        "date": task.get("date"),          # date assigned / task date (YYYY-MM-DD)
        "deadline": task.get("deadline"),  # deadline date (YYYY-MM-DD)
        "priority": task.get("priority"),
        "urgent": task.get("urgent", False),
        "category": task.get("category", "General"),
        "completed": task.get("completed", False),
        "created_at": task.get("created_at"),
        "updated_at": task.get("updated_at"),
    }

@todo_api.route("/tasks", methods=["POST"])
def create_task():
    data = request.json or {}
    required = ["user_id", "title", "date"]
    if not all(k in data and data[k] for k in required):
        return jsonify({"error": "Missing required fields (user_id, title, date)"}), 400

    now = datetime.utcnow().isoformat()
    new_task = {
        "user_id": data["user_id"],
        "title": data["title"],
        "description": data.get("description", ""),
        "date": data.get("date"),        # YYYY-MM-DD
        "deadline": data.get("deadline"),
        "priority": data.get("priority", "Medium"),
        "urgent": bool(data.get("urgent", False)),
        "category": data.get("category", "General"),
        "completed": bool(data.get("completed", False)),
        "created_at": now,
        "updated_at": now,
    }
    res = tasks_collection.insert_one(new_task)
    created = tasks_collection.find_one({"_id": res.inserted_id})
    return jsonify(serialize_task(created)), 201

@todo_api.route("/tasks/<user_id>", methods=["GET"])
def get_tasks_for_user(user_id):
    tasks = list(tasks_collection.find({"user_id": user_id}).sort("created_at", -1))
    return jsonify([serialize_task(t) for t in tasks]), 200

@todo_api.route("/tasks/item/<task_id>", methods=["GET"])
def get_single(task_id):
    try:
        t = tasks_collection.find_one({"_id": ObjectId(task_id)})
    except:
        return jsonify({"error": "Invalid task id"}), 400
    if not t:
        return jsonify({"error": "Not found"}), 404
    return jsonify(serialize_task(t)), 200

@todo_api.route("/tasks/<task_id>", methods=["PUT"])
def update_task(task_id):
    data = request.json or {}
    update = {}
    allowed = ["title","description","date","deadline","priority","urgent","category","completed"]
    for k in allowed:
        if k in data:
            update[k] = data[k]
    if not update:
        return jsonify({"error": "Nothing to update"}), 400
    update["updated_at"] = datetime.utcnow().isoformat()
    try:
        res = tasks_collection.find_one_and_update(
            {"_id": ObjectId(task_id)},
            {"$set": update},
            return_document=True
        )
    except:
        return jsonify({"error": "Invalid task id"}), 400
    if not res:
        return jsonify({"error": "Not found"}), 404
    return jsonify(serialize_task(res)), 200

@todo_api.route("/tasks/<task_id>", methods=["DELETE"])
def delete_task(task_id):
    try:
        r = tasks_collection.delete_one({"_id": ObjectId(task_id)})
    except:
        return jsonify({"error": "Invalid task id"}), 400
    if r.deleted_count == 0:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"success": True}), 200
