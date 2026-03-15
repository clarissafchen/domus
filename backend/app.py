# imports
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
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
class MemoryItem(BaseModel):
    text: str
    type: str = "note"
    subject: str = ""
    details: str = ""
    scheduled_for: str = ""
    status: str = "active"


class MemoryUpdateRequest(BaseModel):
    id: str
    text: Optional[str] = None
    type: Optional[str] = None
    subject: Optional[str] = None
    details: Optional[str] = None
    scheduled_for: Optional[str] = None
    status: Optional[str] = None


class MemoryDeleteRequest(BaseModel):
    id: str


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
        items.append({
            "id": doc.id,
            "text": data.get("text", ""),
            "type": data.get("type", "note"),
            "subject": data.get("subject", ""),
            "details": data.get("details", ""),
            "scheduled_for": data.get("scheduled_for", ""),
            "status": data.get("status", "active"),
        })

    return {"items": items}


# add new memory item
@app.post("/memory")
def add_memory(item: MemoryItem):
    doc_ref = db.collection("memory").add(item.dict())[1]
    return {"status": "memory stored", "item": {"id": doc_ref.id, **item.dict()}}


# delete memory item
@app.delete("/memory")
def delete_memory(item: MemoryDeleteRequest):
    doc_ref = db.collection("memory").document(item.id)
    snapshot = doc_ref.get()

    if not snapshot.exists:
        return {
            "status": "memory not found",
            "id": item.id,
            "deleted": 0,
        }

    doc_ref.delete()

    return {
        "status": "memory deleted",
        "id": item.id,
        "deleted": 1,
    }


# update memory item
@app.put("/memory")
def update_memory(item: MemoryUpdateRequest):
    doc_ref = db.collection("memory").document(item.id)
    snapshot = doc_ref.get()

    if not snapshot.exists:
        return {
            "status": "memory not found",
            "id": item.id,
            "updated": 0,
        }

    updates = {}

    if item.text is not None:
        updates["text"] = item.text
    if item.type is not None:
        updates["type"] = item.type
    if item.subject is not None:
        updates["subject"] = item.subject
    if item.details is not None:
        updates["details"] = item.details
    if item.scheduled_for is not None:
        updates["scheduled_for"] = item.scheduled_for
    if item.status is not None:
        updates["status"] = item.status

    if not updates:
        return {
            "status": "no updates provided",
            "id": item.id,
            "updated": 0,
        }

    doc_ref.update(updates)

    updated_doc = doc_ref.get().to_dict() or {}

    return {
        "status": "memory updated",
        "item": {
            "id": item.id,
            "text": updated_doc.get("text", ""),
            "type": updated_doc.get("type", "note"),
            "subject": updated_doc.get("subject", ""),
            "details": updated_doc.get("details", ""),
            "scheduled_for": updated_doc.get("scheduled_for", ""),
            "status": updated_doc.get("status", "active"),
        },
        "updated": 1,
    }

# optional simple backend-generated briefing
@app.get("/briefing")
def get_briefing():
    docs = db.collection("memory").order_by("text").stream()

    items = []
    for doc in docs:
        data = doc.to_dict()
        text = data.get("text", "")
        scheduled_for = data.get("scheduled_for", "")

        if text:
            if scheduled_for:
                items.append(f"{text} ({scheduled_for})")
            else:
                items.append(text)

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

    try:
        events = runner.run(
            user_id=request.user_id,
            session_id=request.session_id,
            new_message=user_message,
        )

        for event in events:
            print("EVENT:", event)
            if event.is_final_response():
                if event.content and event.content.parts:
                    final_text = "".join(
                        part.text
                        for part in event.content.parts
                        if getattr(part, "text", None)
                    )
                break

    except Exception as e:
        print("CHAT ERROR:", repr(e))
        final_text = f"Domus error: {str(e)}"

    return {"reply": final_text}