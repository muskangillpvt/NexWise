from fastapi import FastAPI, HTTPException, Request
from typing import Dict, Any
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
import requests
import logging

# Firebase + MongoDB

from firebase_admin_setup import verify_token
from db import currency_collection   # create this collection in db.py

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("currency_api")

app = FastAPI(title="NexWise Currency API (exchangerate-api.com)")

# CORS so your React app at localhost:3000 can call this
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EXCHANGE_API_BASE = "https://api.exchangerate-api.com/v4/latest"
REQUEST_TIMEOUT = 8  # seconds

# Helper: get Firebase user ID from Authorization header

def get_user_id(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None
    token = auth_header.replace("Bearer ", "")
    decoded = verify_token(token)
    if not decoded:
        return None
    return decoded.get("uid")

# /api/convert endpoint (with optional user tracking)

@app.post("/api/convert")
async def convert(payload: Dict[str, Any], request: Request):
    from_code = payload.get("from") or payload.get("from_currency") or payload.get("from_")
    to_code = payload.get("to")
    amount = payload.get("amount")

    if from_code is None or to_code is None or amount is None:
        raise HTTPException(status_code=400, detail="Missing required parameters: from, to, amount")

    try:
        amt = float(amount)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid amount (must be numeric)")

    if amt < 0:
        raise HTTPException(status_code=400, detail="Amount must be non-negative")

    from_code = from_code.upper()
    to_code = to_code.upper()

    try:
        resp = requests.get(
            f"{EXCHANGE_API_BASE}/{from_code}",
            timeout=REQUEST_TIMEOUT,
        )
        data = resp.json()
    except Exception as e:
        logger.exception("Error calling exchangerate-api.com")
        raise HTTPException(status_code=502, detail=f"External API request failed: {e}")

    rates = data.get("rates") or {}
    if to_code not in rates:
        raise HTTPException(
            status_code=502,
            detail=f"Missing rate for {to_code}. Raw: {str(data)[:300]}",
        )

    rate = float(rates[to_code])
    result = rate * amt
    response = {
        "success": True,
        "rate": rate,
        "result": result,
        "from": from_code,
        "to": to_code,
        "date": data.get("date") or datetime.utcnow().isoformat(),
        "raw": data,
    }


    # Store conversion in MongoDB for this user
    user_id = get_user_id(request)
    if user_id:
        currency_collection.insert_one({
            "user_id": user_id,
            "from": from_code,
            "to": to_code,
            "amount": amt,
            "result": result,
            "rate": rate,
            "date": datetime.utcnow(),
        })

    return response

# /api/symbols endpoint

@app.get("/api/symbols")
def get_symbols():
    symbols = {
        "USD": {"description": "United States Dollar", "code": "USD"},
        "INR": {"description": "Indian Rupee", "code": "INR"},
        "EUR": {"description": "Euro", "code": "EUR"},
        "GBP": {"description": "British Pound Sterling", "code": "GBP"},
        "AUD": {"description": "Australian Dollar", "code": "AUD"},
        "JPY": {"description": "Japanese Yen", "code": "JPY"},
        "CAD": {"description": "Canadian Dollar", "code": "CAD"},
        "SGD": {"description": "Singapore Dollar", "code": "SGD"},
        "CNY": {"description": "Chinese Yuan", "code": "CNY"},
        "AED": {"description": "UAE Dirham", "code": "AED"},
    }
    return {"symbols": symbols}
