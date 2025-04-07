from flask import Flask, jsonify
from flask_cors import CORS  # Add CORS support
import threading
import time
import random  # Replace this with actual gaze data processing from openEyeTrack

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
activeness_score = 0

def simulate_eye_data_processing():
    global activeness_score
    while True:
        # Simulated values (replace with actual openEyeTrack integration)
        fixation_percentage = random.uniform(60, 95)
        blink_rate = random.uniform(10, 25)
        pupil_dilation = random.uniform(0.2, 0.8)

        # Normalize blink rate (lower is better)
        inverse_blink = max(0, 30 - blink_rate) / 30.0 * 100

        # Activeness score formula
        activeness_score = int(
            (fixation_percentage * 0.5) +
            (inverse_blink * 0.3) +
            (pupil_dilation * 100 * 0.2)
        )
        time.sleep(2)  # Simulate real-time updates

@app.route("/activeness", methods=["GET"])
def get_activeness():
    return jsonify({
        "activeness": activeness_score,
        "timestamp": time.time()
    })

if __name__ == "__main__":
    threading.Thread(target=simulate_eye_data_processing, daemon=True).start()
    app.run(host="0.0.0.0", port=5001) 