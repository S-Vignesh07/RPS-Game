# Rock Paper Scissors AI — Full Stack (Python + HTML/CSS/JS)

A web-based Rock-Paper-Scissors game where your webcam gesture is detected
**in the browser** (MediaPipe Hands JS) and the round is played/scored by a
**Flask backend** with SQLite storage and a leaderboard.

## Architecture
- **Frontend:** HTML/CSS + vanilla JS, MediaPipe Hands (loaded via CDN) for
  real-time gesture detection directly in the browser — no video is ever
  sent to the server.
- **Backend:** Flask REST API — decides the computer's move, judges the
  winner, and persists matches.
- **Database:** SQLite (`database.db`, auto-created on first run) via
  Flask-SQLAlchemy.

## Project structure
```
rps_fullstack/
├── app.py                  # Flask entry point
├── models.py                # SQLAlchemy models
├── requirements.txt
├── routes/
│   ├── game.py               # POST /api/play, GET /api/history/<name>
│   └── leaderboard.py         # GET /api/leaderboard
├── templates/
│   ├── base.html
│   ├── index.html             # Game page (webcam + controls)
│   └── leaderboard.html
└── static/
    ├── css/style.css
    └── js/
        ├── gesture.js          # MediaPipe hand tracking + classification
        └── game.js             # Countdown, API calls, scoreboard UI
```

## Setup

```bash
cd rps_fullstack
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
python app.py
```

Then open **http://localhost:5000** in your browser (Chrome/Edge recommended).
Allow camera access when prompted.

> Webcam access requires a secure context. `localhost` works fine for local
> dev; for real deployment you'll need HTTPS.

## How a round works
1. Enter your name, click **Play Round**.
2. A 3-second countdown runs while MediaPipe tracks your hand landmarks
   live (drawn as an overlay on the video).
3. When the countdown ends, the currently detected gesture (Rock/Paper/
   Scissors) is sent to `POST /api/play`.
4. The Flask backend randomly picks the computer's move, determines the
   winner, saves the match to SQLite, and returns the result.
5. The scoreboard and result panel update instantly.

## API reference

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/play` | `{ "player_choice": "Rock", "player_name": "Alice" }` | Play one round |
| GET | `/api/history/<player_name>` | — | Last 20 matches for a player |
| GET | `/api/leaderboard` | — | Top 20 players by wins, with win rate |

## Extending this project
- **Auth:** add Flask-Login or JWT so scores are tied to real accounts.
- **Multiplayer:** add Flask-SocketIO for real-time two-player matches.
- **Custom-trained model:** swap the rule-based finger-counting in
  `gesture.js` for a TensorFlow.js model trained on your own gesture data.
- **Deploy:** push backend to Render/Railway (set `SQLALCHEMY_DATABASE_URI`
  to a managed Postgres URL in production), serve static/templates from the
  same Flask app or split the frontend to Vercel/Netlify and enable CORS
  (already included via `flask-cors`).
