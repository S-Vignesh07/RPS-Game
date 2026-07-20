import os
from flask import Flask, render_template
from flask_cors import CORS

from models import db
from routes.game import game_bp
from routes.leaderboard import leaderboard_bp

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{os.path.join(BASE_DIR, 'database.db')}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

app.register_blueprint(game_bp)
app.register_blueprint(leaderboard_bp)

with app.app_context():
    db.create_all()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/leaderboard")
def leaderboard_page():
    return render_template("leaderboard.html")


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
