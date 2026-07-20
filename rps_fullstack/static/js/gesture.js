// gesture.js
// Runs MediaPipe Hands on the webcam feed, classifies the current hand
// shape as Rock / Paper / Scissors, and exposes it via window.currentGesture
// so game.js can read it when a round is captured.

window.currentGesture = null;

const videoEl = document.getElementById("webcam");
const canvasEl = document.getElementById("overlay");
const canvasCtx = canvasEl.getContext("2d");
const gestureLabel = document.getElementById("detectedGesture");

const FINGER_TIPS = [4, 8, 12, 16, 20];
const FINGER_PIPS = [3, 6, 10, 14, 18];

function countExtendedFingers(landmarks, handednessLabel) {
    const fingers = [];

    // Thumb: compare x of tip vs pip (mirrored logic depends on hand side)
    if (handednessLabel === "Right") {
        fingers.push(landmarks[FINGER_TIPS[0]].x < landmarks[FINGER_PIPS[0]].x);
    } else {
        fingers.push(landmarks[FINGER_TIPS[0]].x > landmarks[FINGER_PIPS[0]].x);
    }

    // Other 4 fingers: tip above pip (lower y = higher on screen)
    for (let i = 1; i < 5; i++) {
        fingers.push(landmarks[FINGER_TIPS[i]].y < landmarks[FINGER_PIPS[i]].y);
    }

    return fingers;
}

function classifyGesture(fingers) {
    const total = fingers.filter(Boolean).length;

    if (total === 0) return "Rock";
    if (total === 5) return "Paper";
    if (total === 2 && fingers[1] && fingers[2] && !fingers[3] && !fingers[4]) {
        return "Scissors";
    }
    return null;
}

function onResults(results) {
    canvasEl.width = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasEl.width, canvasEl.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        const handedness = results.multiHandedness[0].label; // 'Left' | 'Right'

        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: "#38bdf8", lineWidth: 3 });
        drawLandmarks(canvasCtx, landmarks, { color: "#facc15", lineWidth: 1, radius: 3 });

        const fingers = countExtendedFingers(landmarks, handedness);
        const gesture = classifyGesture(fingers);

        window.currentGesture = gesture;
        gestureLabel.textContent = gesture ? `Detected: ${gesture}` : "Detected: (unclear)";
    } else {
        window.currentGesture = null;
        gestureLabel.textContent = "Show your hand...";
    }

    canvasCtx.restore();
}

const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
});

hands.onResults(onResults);

const camera = new Camera(videoEl, {
    onFrame: async () => {
        await hands.send({ image: videoEl });
    },
    width: 640,
    height: 480,
});

camera.start().catch((err) => {
    document.getElementById("statusMessage").textContent =
        "Could not access webcam. Please allow camera permissions and reload.";
    console.error(err);
});
