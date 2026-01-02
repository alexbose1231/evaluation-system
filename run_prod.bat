@echo off
echo Starting Production Server (Backend + Frontend)...
echo Ensure you have run 'npm run build' in client directory!
set PYTHONPATH=backend
python -m uvicorn backend.main:app --reload --port 8000
pause
