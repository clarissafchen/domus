# Domus

Household assistant with shared memory.

## Run backend
cd backend
source venv/bin/activate
python3 -m uvicorn app:app --reload

## Run agent
cd backend
source venv/bin/activate
adk run domus_agent