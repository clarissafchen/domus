# Domus

Household assistant with shared memory.

## Backend

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python3 -m uvicorn app:app --reload
```

## Agent

```bash
cd backend
source venv/bin/activate
adk run domus_agent
```
