// game.js
// Handles the countdown, captures the detected gesture from gesture.js,
// calls the backend /api/play endpoint, and updates the UI/scoreboard.

const playBtn = document.getElementById("playBtn");
const countdownDisplay = document.getElementById("countdownDisplay");
const resultPanel = document.getElementById("resultPanel");
const playerChoiceText = document.getElementById("playerChoiceText");
const computerChoiceText = document.getElementById("computerChoiceText");
const resultText = document.getElementById("resultText");
const statusMessage = document.getElementById("statusMessage");
const playerNameInput = document.getElementById("playerName");

const winCountEl = document.getElementById("winCount");
const loseCountEl = document.getElementById("loseCount");
const drawCountEl = document.getElementById("drawCount");

let scores = { win: 0, lose: 0, draw: 0 };

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runCountdown() {
    for (let i = 3; i >= 1; i--) {
        countdownDisplay.textContent = i;
        await sleep(1000);
    }
    countdownDisplay.textContent = "";
}

async function playRound() {
    playBtn.disabled = true;
    statusMessage.textContent = "";
    resultPanel.style.display = "none";

    await runCountdown();

    const gesture = window.currentGesture;

    if (!gesture) {
        statusMessage.textContent = "Couldn't detect a clear gesture — try again with a clearer Rock/Paper/Scissors shape.";
        playBtn.disabled = false;
        return;
    }

    const playerName = playerNameInput.value.trim() || "Guest";

    try {
        const res = await fetch("/api/play", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ player_choice: gesture, player_name: playerName }),
        });

        if (!res.ok) {
            throw new Error(`Server responded with ${res.status}`);
        }

        const data = await res.json();
        displayResult(data);
    } catch (err) {
        statusMessage.textContent = "Error contacting server. Is the Flask backend running?";
        console.error(err);
    } finally {
        playBtn.disabled = false;
    }
}

function displayResult(data) {
    playerChoiceText.textContent = data.player_choice;
    computerChoiceText.textContent = data.computer_choice;

    let label, colorClass;
    if (data.result === "win") {
        label = "You Win! 🎉";
        scores.win++;
    } else if (data.result === "lose") {
        label = "Computer Wins!";
        scores.lose++;
    } else {
        label = "Draw!";
        scores.draw++;
    }

    resultText.textContent = label;
    resultPanel.style.display = "block";

    winCountEl.textContent = scores.win;
    loseCountEl.textContent = scores.lose;
    drawCountEl.textContent = scores.draw;
}

playBtn.addEventListener("click", playRound);
