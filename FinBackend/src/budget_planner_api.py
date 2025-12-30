from flask import Blueprint, request, jsonify
from flask_cors import CORS
from firebase_admin_setup import verify_token
from bson import ObjectId

from db import (
    users_collection,
    budget_collection,
    expense_collection
)

budget_api = Blueprint('budget_api', __name__)
CORS(budget_api)


#GET USER ID (Firebase Auth) 
def get_user_id():
    token = request.headers.get("Authorization")
    if not token:
        return None
    decoded_token = verify_token(token)
    if not decoded_token:
        return None
    return decoded_token.get("uid")   # Firebase UID


#SET TOTAL BUDGET
@budget_api.route('/set_total_budget', methods=['POST'])
def set_total_budget():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json()
    total = data.get("total_budget", 0)

    # Update or create user's budget document
    budget_collection.update_one(
        {"user_id": user_id},
        {"$set": {"total_budget": float(total)}},
        upsert=True
    )

    return jsonify({"message": "Total budget saved successfully!"}), 200


# ADD CATEGORY BUDGET 
@budget_api.route('/add_category_budget', methods=['POST'])
def add_category_budget():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json()
    category = data.get("category")
    amount = float(data.get("amount"))

    # Store category budget inside array
    budget_collection.update_one(
        {"user_id": user_id},
        {"$set": {f"category_budgets.{category}": amount}},
        upsert=True
    )

    return jsonify({"message": "Category budget saved successfully!"}), 200


# BUDGET SUMMARY 
@budget_api.route('/get_budget_summary', methods=['GET'])
def get_budget_summary():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    #FETCH USER'S BUDGET
    budget_doc = budget_collection.find_one({"user_id": user_id})

    total_budget = budget_doc.get("total_budget", 0) if budget_doc else 0
    category_budgets = budget_doc.get("category_budgets", {}) if budget_doc else {}

    # CATEGORY-WISE EXPENSES
    pipeline_cat = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$category", "total": {"$sum": "$amount"}}}
    ]
    results = list(expense_collection.aggregate(pipeline_cat))

    category_expenses = {r["_id"]: r["total"] for r in results}

    #TOTAL EXPENSES
    pipeline_total = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    total_result = list(expense_collection.aggregate(pipeline_total))
    total_spent = total_result[0]["total"] if total_result else 0

    remaining = total_budget - total_spent

    #WARNINGS
    warnings = []
    for cat, limit in category_budgets.items():
        spent = category_expenses.get(cat, 0)
        if spent >= 0.9 * limit:
            warnings.append(f"⚠️ {cat} budget nearly used ({spent}/{limit})")

    summary = {
        "total_budget": total_budget,
        "total_spent": total_spent,
        "remaining": remaining,
        "category_budgets": category_budgets,
        "category_expenses": category_expenses,
        "warnings": warnings
    }

    return jsonify(summary), 200
