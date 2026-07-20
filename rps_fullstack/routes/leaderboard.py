from flask import Blueprint, jsonify
from sqlalchemy import func, case
from models import db, Match

leaderboard_bp = Blueprint("leaderboard", __name__)


@leaderboard_bp.route("/api/leaderboard", methods=["GET"])
def get_leaderboard():
    results = (
        db.session.query(
            Match.player_name,
            func.count(Match.id).label("total_games"),
            func.sum(case((Match.result == "win", 1), else_=0)).label("wins"),
            func.sum(case((Match.result == "lose", 1), else_=0)).label("losses"),
            func.sum(case((Match.result == "draw", 1), else_=0)).label("draws"),
        )
        .group_by(Match.player_name)
        .order_by(func.sum(case((Match.result == "win", 1), else_=0)).desc())
        .limit(20)
        .all()
    )

    leaderboard = [
        {
            "player_name": row.player_name,
            "total_games": row.total_games,
            "wins": row.wins,
            "losses": row.losses,
            "draws": row.draws,
            "win_rate": round((row.wins / row.total_games) * 100, 1) if row.total_games else 0,
        }
        for row in results
    ]

    return jsonify(leaderboard)
