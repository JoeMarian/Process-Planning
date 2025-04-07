import streamlit as st
import cv2
import mediapipe as mp
import time

# Streamlit UI Setup
st.set_page_config(page_title="Live Eye Activeness Tracker", layout="centered")
st.title("👁️ Real-Time Eye Gaze Activeness Tracker")
st.markdown("Tracking focus every **5 seconds** from your webcam. Alerts you when activeness drops below 40%!")

start_tracking = st.button("🎥 Start Webcam and Begin Live Tracking")

if start_tracking:
    FRAME_WINDOW = st.image([])
    alert_placeholder = st.empty()
    percentage_display = st.empty()

    mp_face_mesh = mp.solutions.face_mesh
    face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True)
    mp_drawing = mp.solutions.drawing_utils

    ACTIVENESS_THRESHOLD = 40
    CHECK_INTERVAL = 5  # seconds

    focused_frames = 0
    total_frames = 0
    interval_start = time.time()

    def is_looking_forward(landmarks, width):
        left_eye = landmarks[474]
        right_eye = landmarks[469]
        gaze_x = (left_eye.x + right_eye.x) / 2
        gaze_px = gaze_x * width
        screen_center = width / 2
        margin = width * 0.15
        return abs(gaze_px - screen_center) < margin

    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        st.error("❌ Webcam not detected. Please enable webcam access.")
    else:
        st.success("✅ Webcam is now active.")

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            st.warning("⚠️ Couldn't access webcam feed.")
            break

        frame = cv2.flip(frame, 1)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = face_mesh.process(rgb)

        total_frames += 1
        h, w, _ = frame.shape

        if result.multi_face_landmarks:
            landmarks = result.multi_face_landmarks[0].landmark
            if is_looking_forward(landmarks, w):
                focused_frames += 1

            mp_drawing.draw_landmarks(
                frame, result.multi_face_landmarks[0],
                mp_face_mesh.FACEMESH_CONTOURS,
                mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=1, circle_radius=1),
                mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=1)
            )

        FRAME_WINDOW.image(frame, channels="BGR")

        if time.time() - interval_start >= CHECK_INTERVAL:
            activeness = (focused_frames / total_frames) * 100 if total_frames > 0 else 0
            percentage_display.markdown(f"### 📊 Activeness: **{activeness:.2f}%**")

            if activeness < ACTIVENESS_THRESHOLD:
                alert_placeholder.error("⚠️ You are less focused! Try paying more attention.")
            else:
                alert_placeholder.success("✅ You're staying attentive! Good job!")

            focused_frames = 0
            total_frames = 0
            interval_start = time.time()

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    FRAME_WINDOW.empty()
    alert_placeholder.empty()
    percentage_display.empty()
    st.success("📷 Webcam session ended.")
