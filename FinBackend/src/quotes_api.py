from flask import Blueprint, jsonify
import random

quotes_api = Blueprint("quotes_api", __name__)

QUOTES = [
    "Small steps every day lead to big results.",
    "Discipline beats motivation.",
    "Your future self will thank you.",
    "Consistency is more important than perfection.",
    "Focus on progress, not perfection.",
    "Every goal starts with the decision to try.",
    "Don't save what's left after spending—spend what's left after saving.",
    "Saving money today is buying freedom for tomorrow.",
    "Future you deserves better than impulse purchases.",
    "Romanticizing saving money era ✨",
    "Choosing stability over chaos this season.",
    "I don't chase money. I manage it.",
    "Protecting my peace and my bank balance",
    "Budgeting but make it aesthetic.",
]

@quotes_api.route("/daily", methods=["GET"])
def get_daily_quote():
    quote = random.choice(QUOTES)
    return jsonify({ "quote": quote })
