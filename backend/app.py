# imports
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, firestore

# initialize Firebase
cred = credentials.Certificate("firebase_key.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

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

# request schema
class MemoryItem(BaseModel):
    text: str


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
        if "text" in data:
            items.append(data["text"])

    return {"items": items}


# add new memory item
@app.post("/memory")
def add_memory(item: MemoryItem):
    db.collection("memory").add({"text": item.text})
    return {"status": "memory stored", "text": item.text}


# delete memory item
@app.delete("/memory")
def delete_memory(item: MemoryItem):
    print("DELETE REQUEST:", item.text)

    docs = db.collection("memory").stream()

    deleted = 0
    target = item.text.lower()

    for doc in docs:
        data = doc.to_dict()
        text = data.get("text", "").lower()

        if target in text:
            doc.reference.delete()
            deleted += 1

    return {
        "status": "memory deleted",
        "text": item.text,
        "deleted": deleted
    }