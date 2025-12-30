from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import subprocess
import os


# ✅ Load environment variables FIRST
load_dotenv()

# ✅ Firebase Admin Initialization (SAFE + REQUIRED)
import firebase_admin
from firebase_admin import credentials

FIREBASE_KEY_PATH = os.getenv("FIREBASE_SERVICE_KEY")

if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_KEY_PATH)
    firebase_admin.initialize_app(cred)
    print("✅ Firebase Admin Initialized Successfully")

# ✅ Import MongoDB Connection
from db import db

# ✅ Create Flask App (ONLY ONCE)
app = Flask(__name__)

# ✅ Enable CORS Globally
CORS(app, resources={r"/*": {"origins": "*"}})

# ✅ Import Blueprints AFTER app + firebase init
from budget_planner_api import budget_api
from expense_tracker_api import expense_api
from saving_goals_api import saving_goals_bp
from todo_api import todo_api
from ai_chat_api import bp as ai_bp
from notes_api import notes_api
from quotes_api import quotes_api
app.register_blueprint(quotes_api, url_prefix="/api/quotes")


# ✅ Register Blueprints
app.register_blueprint(budget_api, url_prefix="/budget")
app.register_blueprint(expense_api, url_prefix="/api/expense")
app.register_blueprint(saving_goals_bp, url_prefix="/api/goals")
app.register_blueprint(todo_api, url_prefix="/api/todo")
app.register_blueprint(ai_bp)  # ✅ /api/chat
app.register_blueprint(notes_api, url_prefix="/api/notes")

# -----------------------------
# ✅ Start Currency FastAPI Server
# -----------------------------
def start_currency_api():
    subprocess.Popen(
        ["uvicorn", "currency_converter:app", "--host", "0.0.0.0", "--port", "8000"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

start_currency_api()

# -----------------------------
# ✅ Run Flask Server
# -----------------------------
if __name__ == "__main__":
    print("🔥 Flask Server Running on http://127.0.0.1:5000")
    print("💱 FastAPI Currency API Running on http://127.0.0.1:8000")
    app.run(debug=True, port=5000)
