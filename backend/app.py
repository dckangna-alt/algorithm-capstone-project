"""Flask backend: serves the frontend and exposes POST /api/generate."""
import os
from flask import Flask, jsonify, request, send_from_directory
from algorithms import generate

FRONTEND = os.path.join(os.path.dirname(__file__), "..", "frontend")
app = Flask(__name__, static_folder=FRONTEND, static_url_path="")


@app.get("/")
def index():
    return send_from_directory(FRONTEND, "index.html")


@app.post("/api/generate")
def api_generate():
    body = request.get_json(silent=True) or {}
    try:
        return jsonify(generate(body.get("data", "")))
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True, port=5000)
