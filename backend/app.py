# imports
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from enum import Enum
from typing import Optional

from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, firestore

from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from domus_agent import root_agent

# initialize Firebase
cred = credentials.Certificate("firebase_key.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# ADK runner/session setup
APP_NAME = "domus"

session_service = InMemorySessionService()

runner = Runner(
    agent=root_agent,
    app_name=APP_NAME,
    session_service=session_service,
)

# FastAPI app
app = FastAPI()

# allow frontend / agent access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# request schemas
class StatusEnum(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"


class MemoryItem(BaseModel):
    text: str
<<<<<<< HEAD
    status: Optional[StatusEnum] = StatusEnum.ACTIVE
=======
    type: str = "note"
    subject: str = ""
    details: str = ""
    scheduled_for: str = ""
    status: str = "active"
>>>>>>> 443ba3b (updated agent entry logic)


class ChatRequest(BaseModel):
    message: str
    user_id: str = "clarissa"
    session_id: str = "domus-demo"


# health check
@app.get("/")
def health():
    return {"status": "Domus backend running"}


# get all household memory items
@app.get("/memory")
def get_memory():
    docs = db.collection("memory").order_by("text").stream()

    items = []
    for doc in docs:
        data = doc.to_dict()
<<<<<<< HEAD
        if "text" in data:
            items.append({
                "text": data["text"],
                "status": data.get("status", StatusEnum.ACTIVE.value)
            })
=======

        items.append({
            "text": data.get("text", ""),
            "type": data.get("type", "note"),
            "subject": data.get("subject", ""),
            "details": data.get("details", ""),
            "status": data.get("status", "active"),
        })
>>>>>>> 443ba3b (updated agent entry logic)

    return {"items": items}


# add new memory item
@app.post("/memory")
def add_memory(item: MemoryItem):
<<<<<<< HEAD
    # Use the value of the Enum member if present, otherwise default to "active"
    status_val = item.status.value if item.status else StatusEnum.ACTIVE.value
    
    db.collection("memory").add({
        "text": item.text,
        "status": status_val
    })
    return {
        "status": "memory stored",
        "text": item.text,
        "item_status": status_val
    }
=======
    db.collection("memory").add(item.dict())
    return {"status": "memory stored", "item": item.dict()}
>>>>>>> 443ba3b (updated agent entry logic)


# delete memory item
@app.delete("/memory")
def delete_memory(item: MemoryItem):
    docs = db.collection("memory").stream()

    deleted = 0
    target = item.text.lower().strip()

    for doc in docs:
        data = doc.to_dict()
        text = data.get("text", "").lower().strip()

        if target in text:
            doc.reference.delete()
            deleted += 1

    return {
        "status": "memory deleted",
        "text": item.text,
        "deleted": deleted
    }


# update memory item
@app.put("/memory")
def update_memory(item: MemoryItem):
    docs = db.collection("memory").stream()

    updated = 0
    target = item.text.lower().strip()
    status_val = item.status.value if item.status else StatusEnum.ACTIVE.value

    for doc in docs:
        data = doc.to_dict()
        text = data.get("text", "").lower().strip()

        if target in text:
            doc.reference.update({"status": status_val})
            updated += 1

    return {
        "status": "memory updated",
        "text": item.text,
        "updated": updated
    }


# optional simple backend-generated briefing
@app.get("/briefing")
def get_briefing():
    docs = db.collection("memory").order_by("text").stream()

    items = []
    for doc in docs:
        data = doc.to_dict()
        if "text" in data:
            items.append(data["text"])

    if not items:
        return {"summary": "There are no household updates right now."}

    bullets = "\n".join([f"• {item}" for item in items[:5]])

    return {
        "summary": f"Here’s what you need to know:\n\n{bullets}"
    }


# ADK agent chat endpoint
@app.post("/chat")
def chat(request: ChatRequest):
    existing_session = session_service.get_session_sync(
        app_name=APP_NAME,
        user_id=request.user_id,
        session_id=request.session_id,
    )

    if existing_session is None:
        session_service.create_session_sync(
            app_name=APP_NAME,
            user_id=request.user_id,
            session_id=request.session_id,
        )

    user_message = types.Content(
        role="user",
        parts=[types.Part(text=request.message)],
    )

    final_text = "Domus did not return a response."

    events = runner.run(
        user_id=request.user_id,
        session_id=request.session_id,
        new_message=user_message,
    )

    for event in events:
        if event.is_final_response():
            if event.content and event.content.parts:
                final_text = "".join(
                    part.text
                    for part in event.content.parts
                    if getattr(part, "text", None)
                )
            break

    return {"reply": final_text}
