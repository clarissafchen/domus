from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health():
    return {"status": "Domus backend running"}

@app.get("/memory")
def get_memory():
    return {
        "items": [
            "Milk",
            "Plumber Tuesday",
            "Dog vet appointment"
        ]
    }