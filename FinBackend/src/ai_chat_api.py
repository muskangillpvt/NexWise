import os
import json
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from dotenv import load_dotenv
from openai import OpenAI
from firebase_admin import auth as firebase_auth

from db import (
    expense_collection,
    budget_collection,
    tasks_collection,
    notes_collection,
    goals_collection,
    users_collection,
    currency_collection
)

# -------------------------------
# ENV
# -------------------------------
load_dotenv()

OPENAI_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_KEY:
    raise RuntimeError("OPENAI_API_KEY missing")

client = OpenAI(api_key=OPENAI_KEY)
MAX_TOKENS = int(os.getenv("AI_REPLY_MAX_TOKENS", 512))

bp = Blueprint("ai_chat", __name__, url_prefix="/api")

# -------------------------------
# AUTH
# -------------------------------
def verify_token_get_uid(req):
    auth_header = req.headers.get("Authorization", "")
    if not auth_header:
        return None, "Missing Authorization header"

    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None, "Invalid Authorization header"

    try:
        decoded = firebase_auth.verify_id_token(parts[1])
        return decoded["uid"], None
    except Exception as e:
        return None, str(e)

# -------------------------------
# INTENT DETECTION
# -------------------------------
def detect_intent(message: str):
    msg = message.lower()

    greetings = ["hi", "hello", "hey", "good morning", "good evening"]

    data_triggers = [
        "my budget",
        "my expenses",
        "my goals",
        "my tasks",
        "my notes",
        "my data",
        "my account",
        "show my data",
        "what is my budget",
        "overview",
        "summary"
    ]

    if any(msg == g or msg.startswith(g) for g in greetings):
        return "greeting"

    if any(k in msg for k in data_triggers):
        return "fetch_user_data"

    return "general"

# -------------------------------
# USER DATA (FIXED FIELD NAMES)
# -------------------------------
def build_full_user_context(uid):
    expenses = list(expense_collection.find({"user_id": uid}))
    budgets = list(budget_collection.find({"user_id": uid}))
    tasks = list(tasks_collection.find({"user_id": uid}))
    notes = list(notes_collection.find({"uid": uid}))
    goals = list(goals_collection.find({"user_id": uid}))
    currency = list(currency_collection.find({"user_id": uid}))

    return {
        "total_budget": sum(float(b.get("total_budget", 0)) for b in budgets),
        "total_expenses": sum(float(e.get("amount", 0)) for e in expenses),
        "expense_count": len(expenses),
        "pending_tasks": sum(1 for t in tasks if not t.get("completed", False)),
        "notes_count": len(notes),
        "goals_count": len(goals),
        "currency_conversions": len(currency)
    }

# -------------------------------
# SYSTEM PROMPT
# -------------------------------
SYSTEM_PROMPT = """
You are a helpful assistant like ChatGPT.

Rules:
- Never assume user problems
- Never use user data unless explicitly requested
- If the user greets, respond briefly
- If user asks for their app data, summarize clearly
- Be concise, accurate, and neutral
"""

# -------------------------------
# CHAT ROUTE
# -------------------------------
@bp.route("/chat", methods=["POST"])
@cross_origin()
def chat():
    try:
        uid, err = verify_token_get_uid(request)
        if err:
            return jsonify({"error": "Unauthorized"}), 401

        user_message = request.json.get("message", "").strip()
        if not user_message:
            return jsonify({"error": "Message required"}), 400

        intent = detect_intent(user_message)

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        if intent == "fetch_user_data":
            context = build_full_user_context(uid)
            messages.append({
                "role": "system",
                "content": f"User app summary:\n{json.dumps(context)}"
            })

        messages.append({"role": "user", "content": user_message})

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.3,
            max_tokens=MAX_TOKENS,
        )

        reply = response.choices[0].message.content.strip()

        users_collection.update_one(
            {"uid": uid},
            {"$push": {"chat_history": {"role": "user", "text": user_message}}},
            upsert=True
        )

        users_collection.update_one(
            {"uid": uid},
            {"$push": {"chat_history": {"role": "bot", "text": reply}}}
        )

        return jsonify({"reply": reply})

    except Exception as e:
        print("AI ERROR:", e)
        return jsonify({"error": "AI failure"}), 500
