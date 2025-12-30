import jwt
from flask import request, jsonify
from dotenv import load_dotenv
import os

load_dotenv()
SECRET_KEY = os.getenv("JWT_SECRET")

def authenticate_user():
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return None

    try:
        token = auth_header.split(" ")[1]
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return {"user_id": decoded["user_id"]}

    except Exception:
        return None
