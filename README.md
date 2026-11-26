# Exam Timetable Generator – Graph Coloring + Backtracking
Kangna | Roll No. 2501060041 | DAA Capstone (Project 8)

## Structure
- frontend/index.html, style.css, script.js  – dashboard UI
- backend/algorithms.py – graph building, greedy and backtracking colouring
- backend/app.py – Flask server (POST /api/generate)

## Run
    pip install -r requirements.txt
    python backend/app.py
Open http://127.0.0.1:5000

## API
POST /api/generate  {"data": "Aman: DAA, OS\nBhavna: DAA, CN"} -> slots, conflicts, timings, load.
