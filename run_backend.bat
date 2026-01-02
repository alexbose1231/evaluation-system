@echo off
echo Starting Backend Server...
set PYTHONPATH=backend
python -m uvicorn backend.main:app --reload
pause
