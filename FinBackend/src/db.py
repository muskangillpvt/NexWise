import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get the MongoDB URI from the .env file
MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError("❌ MONGO_URI is missing! Add it to your .env file.")

# Create a single global MongoDB client
client = MongoClient(MONGO_URI)

# Select your database
db = client["finbuddy"]

# Define collections (you can add more later)
users_collection = db["users"]
budget_collection = db["budget"]
expense_collection = db["expenses"]
goals_collection = db["goals"]
loan_collection = db["loans"]
tax_collection = db["tax"]
category_collection = db["categories"]
currency_collection = db["currency"]
tasks_collection = db["tasks"]
notes_collection = db["notes"]
quotes_collection = db["quotes"]
