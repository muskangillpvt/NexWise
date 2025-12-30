from flask import Blueprint, request, jsonify
from firebase_admin import auth
from db import notes_collection
from datetime import datetime
from bson import ObjectId

notes_api = Blueprint("notes_api", __name__)

# 🔐 Helper: verify Firebase token
def verify_user(request):
    token = request.headers.get("Authorization")
    if not token:
        return None

    try:
        decoded = auth.verify_id_token(token.replace("Bearer ", ""))
        return decoded["uid"]
    except Exception:
        return None


# 📝 Add new note
@notes_api.route("/add", methods=["POST"])
def add_note():
    uid = verify_user(request)
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    note = {
        "uid": uid,
        "content": data.get("content", ""),
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
    }

    result = notes_collection.insert_one(note)

    # ✅ return saved note with id
    note["_id"] = str(result.inserted_id)
    return jsonify(note)


# 📥 Get ALL notes (IMPORTANT FIX)
@notes_api.route("", methods=["GET"])
def get_all_notes():
    uid = verify_user(request)
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401

    notes = list(
        notes_collection.find(
            {"uid": uid},
            sort=[("createdAt", -1)]
        )
    )

    for n in notes:
        n["_id"] = str(n["_id"])

    return jsonify(notes)


# 📥 Get latest note (unchanged)
@notes_api.route("/latest", methods=["GET"])
def get_latest_note():
    uid = verify_user(request)
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401

    note = notes_collection.find_one(
        {"uid": uid},
        sort=[("createdAt", -1)]
    )

    if note:
        note["_id"] = str(note["_id"])

    return jsonify(note or {})


# ✏️ Update note (FIXED)
@notes_api.route("/update", methods=["PUT"])
def update_note():
    uid = verify_user(request)
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    note_id = data.get("id")

    notes_collection.update_one(
        {"_id": ObjectId(note_id), "uid": uid},
        {
            "$set": {
                "content": data.get("content"),
                "updatedAt": datetime.utcnow()
            }
        }
    )

    return jsonify({"message": "Note updated"})


# 🗑 Delete note (FIXED)
@notes_api.route("/delete", methods=["DELETE"])
def delete_note():
    uid = verify_user(request)
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    note_id = data.get("id")

    notes_collection.delete_one(
        {"_id": ObjectId(note_id), "uid": uid}
    )

    return jsonify({"message": "Note deleted"})