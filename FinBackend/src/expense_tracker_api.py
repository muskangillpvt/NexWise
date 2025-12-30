from flask import Blueprint, request, jsonify, send_from_directory
from pymongo import MongoClient
from firebase_admin_setup import verify_token
import os
from datetime import datetime
from flask_cors import CORS
from werkzeug.utils import secure_filename
from bson import ObjectId

# Import MongoDB collections from db.py
from db import (
    users_collection,
    budget_collection,
    expense_collection,
    goals_collection,
    loan_collection,
    tax_collection
)

expense_api = Blueprint("expense_api", __name__)
CORS(expense_api)

UPLOAD_FOLDER = "uploaded_bills"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Helper to get user_id (Firebase UID) 
def get_user_id():
    token = request.headers.get("Authorization")
    if not token:
        return None
    decoded_token = verify_token(token)  # verify_token must return Firebase UID
    if not decoded_token:
        return None
    return decoded_token.get('uid')  # <-- ensure it's the UID
#ADD EXPENSE 
@expense_api.route('/add_expense', methods=['POST'])
def add_expense():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.form
    date = data.get("date")
    category = data.get("category")
    description = data.get("description")
    amount = float(data.get("amount"))
    payment_mode = data.get("payment_mode")
    currency = data.get("currency", "$")

    # File upload
    bill_file = request.files.get('bill')
    bill_filename = None

    if bill_file and bill_file.filename:
        if not allowed_file(bill_file.filename):
            return jsonify({"message": "File type not allowed"}), 400

        safe_name = secure_filename(bill_file.filename)
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S%f")
        bill_filename = f"{timestamp}_{safe_name}"
        bill_file.save(os.path.join(UPLOAD_FOLDER, bill_filename))

    # Insert into MongoDB with user_id
    expense_doc = {
        "user_id": user_id,
        "date": date,
        "category": category,
        "description": description,
        "amount": amount,
        "payment_mode": payment_mode,
        "currency": currency,
        "bill_filename": bill_filename
    }

    expense_collection.insert_one(expense_doc)
    return jsonify({"message": "Expense added successfully!"}), 201

# GET ALL EXPENSES 
@expense_api.route('/get_expenses', methods=['GET'])
def get_expenses():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    category = request.args.get("category")
    query = {"user_id": user_id}  # <-- only fetch this user's data
    if category:
        query["category"] = category

    expenses = list(expense_collection.find(query))

    # Convert ObjectId to string
    for e in expenses:
        e["id"] = str(e["_id"])
        del e["_id"]

    return jsonify(expenses)

#SUMMARY
@expense_api.route('/get_summary', methods=['GET'])
def get_summary():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    # Total spending
    pipeline_total = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    total_result = list(expense_collection.aggregate(pipeline_total))
    total_spent = total_result[0]["total"] if total_result else 0

    # Category-wise totals
    pipeline_cat = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$category", "total": {"$sum": "$amount"}}}
    ]
    cat_results = list(expense_collection.aggregate(pipeline_cat))
    category_totals = [{"category": c["_id"], "total": c["total"]} for c in cat_results]

    # Dummy budget (replace when you add Budget module)
    dummy_budget = 5000
    remaining = dummy_budget - total_spent

    return jsonify({
        "total_spent": total_spent,
        "budget": dummy_budget,
        "remaining": remaining,
        "category_totals": category_totals
    })

#  EXPENSE ANALYTICS
@expense_api.route('/get_analytics', methods=['GET'])
def get_analytics():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$category", "total": {"$sum": "$amount"}}},
        {"$sort": {"total": -1}},
        {"$limit": 3}
    ]
    results = list(expense_collection.aggregate(pipeline))
    top_categories = [{"category": r["_id"], "total": r["total"]} for r in results]

    analytics = {
        "top_categories": top_categories,
        "tips": [
            "Review your top expenses and reduce by 10%.",
            "Avoid impulse purchases by setting a 24-hour wait rule.",
            "Use digital wallets to track spending automatically.",
            "Set weekly mini-budgets for tighter control."
        ]
    }
    return jsonify(analytics)

#  DELETE EXPENSE BY ID
@expense_api.route('/delete_expense/<string:expense_id>', methods=['DELETE'])
def delete_expense_by_id(expense_id):
    user_id = get_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    result = expense_collection.delete_one({
        "_id": ObjectId(expense_id),
        "user_id": user_id  # ensure only owner can delete
    })

    if result.deleted_count == 1:
        return jsonify({"message": "Expense deleted"}), 200
    else:
        return jsonify({"message": "Expense not found"}), 404

# SERVE BILL FILES
@expense_api.route('/bills/<path:filename>', methods=['GET'])
def serve_bill(filename):
    return send_from_directory(UPLOAD_FOLDER, filename, as_attachment=False)
