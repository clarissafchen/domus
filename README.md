# Domus

Domus is a multimodal household memory assistant that captures, organizes, and retrieves shared household information through chat and images.

Users can add reminders, notes, tasks, and events through chat or screenshots. Domus converts these inputs into structured memory items that can be retrieved, updated, or deleted later.

This project was built using Gemini models, Google ADK, and Google Cloud services as part of a hackathon project submission.

---

# Architecture Overview

Domus is composed of three primary layers:

User → Next.js Frontend → FastAPI Backend → Gemini Agent → Firestore

The system interprets chat requests, converts them into structured memory operations, and persists them in a shared household memory store.

---

# Repository Structure

```
domus
│
├─ apps
│  ├─ api
│  │  ├─ app.py
│  │  └─ domus_agent
│  │     └─ agent.py
│  │
│  └─ web
│     └─ app
│        └─ page.tsx
│
├─ package.json
└─ bun.lock
```

---

# Core Components

## Frontend (Next.js)

Location:

```
apps/web
```

Responsibilities:

- Chat interface
- Image upload and clipboard paste support
- Display assistant responses
- Show household memory list
- Manage authentication state
- Send requests to backend API

Technologies:

- Next.js
- React
- Bun
- Firebase Web SDK

---

## Backend API (FastAPI)

Location:

```
apps/api/app.py
```

Responsibilities:

- Expose REST endpoints
- Receive multimodal chat requests
- Invoke Gemini agent
- Manage Firestore memory storage

Key endpoints:

| Endpoint | Purpose |
|--------|--------|
| GET / | Health check |
| POST /chat | Multimodal chat interface |
| GET /memory | Retrieve memory items |
| POST /memory | Create memory |
| PUT /memory | Update memory |
| DELETE /memory | Delete memory |
| GET /briefing | Generate summary |

---

## Agent Layer

Location:

```
apps/api/domus_agent/agent.py
```

The conversational agent is implemented using the Google Agent Development Kit (ADK).

Model used:

```
Gemini 2.5 Flash
```

The agent interprets user messages and decides when to call system tools.

Available tools:

- get_current_datetime
- get_household_memory
- add_household_memory
- update_household_memory
- delete_household_memory

---

# Multimodal Processing

Domus supports both text and image input.

Users can:

- upload images
- paste screenshots directly into chat

Images are converted into Gemini-compatible inline data before being sent to the model.

This allows Domus to extract structured information from screenshots such as reminders, lists, or tickets.

---

# Memory Data Model

Household memory is stored as structured objects in Firestore.

Example schema:

```
{
  "text": "Launch project",
  "type": "task",
  "subject": "project",
  "scheduled_for": "2026-03-16T18:00",
  "status": "active"
}
```

Fields include:

- id
- text
- type
- subject
- details
- scheduled_for
- status

---

# Authentication

Authentication is handled through Firebase Auth.

The frontend obtains a Firebase ID token after login and sends it with API requests.

During hackathon development the backend temporarily bypasses Firebase verification to allow internal agent tool calls to access the memory API without authorization errors.

---

# Development

Start the frontend:

```
cd apps/web
bun run dev
```

Start the backend:

```
cd apps/api
uvicorn app:app --reload
```

Frontend:

```
http://localhost:3000
```

Backend:

```
http://localhost:8000
```

---

# Key Capabilities

- Conversational household memory
- Multimodal screenshot understanding
- Structured memory storage
- Tool-driven AI agent
- Firestore-backed persistence

---

# Hackathon Note

This project and accompanying content were created for the purposes of entering a Google Cloud AI hackathon. The system demonstrates how Gemini models and Google Cloud infrastructure can be used to build a multimodal assistant for managing shared household information.
