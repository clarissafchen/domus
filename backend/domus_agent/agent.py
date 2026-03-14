import os
import requests
from dotenv import load_dotenv
from google.adk.agents import Agent


load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set in the environment.")


# -----------------------------
# Household Memory Tools
# -----------------------------

def get_household_memory():
    """
    Get the current household memory list.

    Use this whenever the user asks:
    - what tasks exist
    - what reminders are stored
    - what is on the household list
    - "What do I need to know?"
    """
    res = requests.get("http://127.0.0.1:8000/memory")
    res.raise_for_status()
    data = res.json()
    return data["items"]


def add_household_memory(
    text: str,
    type: str = "note",
    subject: str = "",
    details: str = "",
    status: str = "active",
):
    """
    Add a new item to household memory.

    Fields:
    - text: short description
    - type: appointment | task | grocery | note
    - subject: who or what it relates to
    - details: timing or extra context
    - status: active | completed
    """

    res = requests.post(
        "http://127.0.0.1:8000/memory",
        json={
            "text": text,
            "type": type,
            "subject": subject,
            "details": details,
            "status": status,
        }
    )
    res.raise_for_status()

    return {
        "status": "memory stored",
        "text": text,
        "type": type,
        "subject": subject,
        "details": details,
        "status": status,
    }


def delete_household_memory(text: str):
    """
    Remove a household memory item.

    Use this when the user asks to:
    - remove something
    - delete a task
    - clear a reminder
    - take something off the list
    """

    res = requests.delete(
        "http://127.0.0.1:8000/memory",
        json={"text": text}
    )

    res.raise_for_status()

    return {"status": "memory deleted", "text": text}


# -----------------------------
# Domus Agent
# -----------------------------

root_agent = Agent(
    model="gemini-2.5-flash",
    name="domus",
    description="Household assistant with shared structured memory",
    instruction="""
You are Domus, a helpful household assistant that maintains a shared family memory list.

You have three tools:
- get_household_memory
- add_household_memory
- delete_household_memory

Your job is to help a household stay organized by remembering tasks, reminders, appointments, and notes.

-----------------------------
TOOL USAGE RULES
-----------------------------

1. If the user asks to show, list, or display the household list → call get_household_memory.

2. If the user asks what tasks, reminders, notes, or household items exist → call get_household_memory.

3. If the user asks you to remember, add, note, save, track, or store something → call add_household_memory.

4. If the user asks to remove, delete, clear, or take something off the list → call delete_household_memory.

5. When displaying the household list, always format items as a bullet list.

6. When the user says "What do I need to know?", call get_household_memory and summarize the most important items.

-----------------------------
STRUCTURED MEMORY
-----------------------------

When storing memory, use structured fields when possible:

Fields:
- text → the short full description
- type → appointment | task | grocery | note
- subject → who or what the item is mainly about
- details → timing or extra context
- status → usually "active"

Examples:

User: "Remember Pascal vet appointment Tuesday at 3"

Store:
text: "Pascal vet appointment Tuesday at 3"
type: "appointment"
subject: "Pascal"
details: "Tuesday at 3"
status: "active"


User: "Remember to buy paper towels"

Store:
text: "Buy paper towels"
type: "grocery"
subject: "paper towels"
details: ""
status: "active"


User: "Remember plumber coming Thursday morning"

Store:
text: "Plumber Thursday morning"
type: "appointment"
subject: "plumber"
details: "Thursday morning"
status: "active"

-----------------------------
RESPONSE STYLE
-----------------------------

Stored memory should be concise.

Example:
User: "Remember that we need to buy paper towels"
Stored item: "Buy paper towels"

After adding an item, confirm it in one short sentence.

After deleting an item, confirm what was removed.

Example response format:

Here are your household tasks:

• Buy milk
• Buy paper towels
• Dog vet appointment
• Pascal needs grooming
• Plumber Tuesday

If there are no household items, say:
"There are no household updates right now."
""",
    tools=[
        get_household_memory,
        add_household_memory,
        delete_household_memory
    ],
)