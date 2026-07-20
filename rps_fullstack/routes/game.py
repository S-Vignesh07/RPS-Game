import random
from flask import Blueprint, request, jsonify
from models import db, Match

game_bp = Blueprint("game", __name__)

CHOICES = ["Rock", "Paper", "Scissors"]

BEATS = {
    "Rock": "Scissors",
    "Paper": "Rock",
    "Scissors": "Paper",
}


def decide_result(player_choice, computer_choice):
    if player_choice == computer_choice:
        return "draw"
    if BEATS[player_choice] == computer_choice:
        return "win"
    return "lose"


@game_bp.route("/api/play", methods=["POST"])
def play_round():
    data = request.get_json(silent=True) or {}
    player_choice = data.get("player_choice")
    player_name = data.get("player_name", "Guest").strip() or "Guest"

    if player_choice not in CHOICES:
        return jsonify({"error": "Invalid or missing player_choice. Must be Rock, Paper, or Scissors."}), 400

    computer_choice = random.choice(CHOICES)
    result = decide_result(player_choice, computer_choice)

    match = Match(
        player_name=player_name,
        player_choice=player_choice,
        computer_choice=computer_choice,
        result=result,
    )
    db.session.add(match)
    db.session.commit()

    return jsonify({
        "player_choice": player_choice,
        "computer_choice": computer_choice,
        "result": result,
        "match_id": match.id,
    })


@game_bp.route("/api/history/<player_name>", methods=["GET"])
def get_history(player_name):
    matches = (
        Match.query.filter_by(player_name=player_name)
        .order_by(Match.created_at.desc())
        .limit(20)
        .all()
    )
    return jsonify([m.to_dict() for m in matches])
