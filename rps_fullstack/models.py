from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Match(db.Model):
    __tablename__ = "matches"

    id = db.Column(db.Integer, primary_key=True)
    player_name = db.Column(db.String(50), nullable=False, default="Guest")
    player_choice = db.Column(db.String(10), nullable=False)
    computer_choice = db.Column(db.String(10), nullable=False)
    result = db.Column(db.String(20), nullable=False)  # 'win' | 'lose' | 'draw'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "player_name": self.player_name,
            "player_choice": self.player_choice,
            "computer_choice": self.computer_choice,
            "result": self.result,
            "created_at": self.created_at.isoformat(),
        }
