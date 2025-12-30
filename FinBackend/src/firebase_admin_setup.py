import firebase_admin
from firebase_admin import credentials, auth
from dotenv import load_dotenv
import os

# Load variables from .env file
load_dotenv()

SERVICE_ACCOUNT_PATH = os.getenv("FIREBASE_SERVICE_KEY")

if not SERVICE_ACCOUNT_PATH:
    raise ValueError("FIREBASE_SERVICE_KEY not found in .env file!")

if not firebase_admin._apps:
    cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
    firebase_admin.initialize_app(cred)

def verify_token(id_token):
    try:
        return auth.verify_id_token(id_token)
    except Exception:
        return None
