import os
import requests
from dotenv import load_dotenv
from google.adk.agents import Agent
from datetime import datetime



load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set in the environment.")


# -----------------------------
# Household Memory Tools
# -----------------------------
def get_current_datetime():
    """
    Return the current local datetime in ISO format.

    Use this whenever you need to resolve phrases like:
    - tomorrow
    - tonight
    - Friday
    - next Tuesday
    - this weekend
    """
    now = datetime.now()

    return {
        "current_datetime": now.isoformat(),
        "date": now.strftime("%Y-%m-%d"),
        "time": now.strftime("%H:%M"),
        "weekday": now.strftime("%A")
    }

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
    scheduled_for: str = "",
    status: str = "active",
):
    """
    Add a new item to household memory.

    Fields:
    - text: short description
    - type: appointment | task | grocery | note
    - subject: who or what it relates to
    - details: extra context, prep notes, or things to remember about the item
    - scheduled_for: optional concrete date/time string for when it happens
    - status: active | completed
    """

    res = requests.post(
        "http://127.0.0.1:8000/memory",
        json={
            "text": text,
            "type": type,
            "subject": subject,
            "details": details,
            "scheduled_for": scheduled_for,
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
        "scheduled_for": scheduled_for,
        "status": status,
    }


def delete_household_memory(id: str):
    """
    Remove a household memory item.

    Use this when the user asks to:
    - remove something
    - delete a task
    - clear a reminder
    - take something off the list

    IMPORTANT:
    This tool deletes by stable memory ID, not by text.
    The agent should call get_household_memory first, identify the matching item,
    and then pass that item's `id` into this tool.
    """

    res = requests.delete(
        "http://127.0.0.1:8000/memory",
        json={"id": id}
    )

    res.raise_for_status()

    return {"status": "memory deleted", "id": id}

def update_household_memory(
    id: str,
    text: str = "",
    details: str = "",
    status: str = ""
):
    """
    Update a household memory item.

    Use this when the user asks to:
    - update a task
    - update a reminder
    - update a note
    - actually
    - change that
    - make that
    - move it
    - add a note

    IMPORTANT:
    This tool updates by stable memory ID, not by text.
    The agent should call get_household_memory first, identify the matching item,
    and then pass that item's `id` into this tool.
    When using this tool, you sould:
    1. look at current memory / recent context
    2. find the target item by id
    3. update item by id
    4. ask clarification questions if ambiguous

    Example:
    User: "Return book to library tomorrow"
    User: "Actually, make that Friday"
    Domus: 
    - Finds the last relevant item by id
    - Updates scheduled_for
    - Confirms the change
    """

# -----------------------------
# Domus Agent
# -----------------------------

root_agent = Agent(
    model="gemini-2.5-flash",
    name="domus",
    description="Household assistant with shared structured memory",
    instruction="""
You are Domus, a helpful household assistant that maintains a shared family memory list.

You have four tools:
- get_current_datetime
- get_household_memory
- add_household_memory
- delete_household_memory

Your job is to help a household stay organized by remembering tasks, reminders, appointments, and notes.

IMPORTANT:
If the user provides a natural language time ("tomorrow", "next Tuesday", "tonight at 7", "Friday at 8"),
you must first call get_current_datetime to determine the current date.

Resolve the time relative to the current date.

scheduled_for must always be stored in ISO datetime format:

YYYY-MM-DDTHH:MM

Example:
User: "Remember car maintenance Friday at 8"

Steps:
1. Call get_current_datetime
2. Determine the next upcoming Friday
3. Convert to ISO datetime
4. Store in scheduled_for

-----------------------------
TOOL USAGE RULES
-----------------------------

1. If the user asks to show, list, or display the household list → call get_household_memory.

2. If the user asks what tasks, reminders, notes, or household items exist → call get_household_memory.

3. If the user asks you to remember, add, note, save, track, or store something → call add_household_memory.

4. If the user asks to remove, delete, clear, or take something off the list:
   - first call get_household_memory
   - identify the matching item
   - then call delete_household_memory using that item's id
   - if multiple items could match, ask a short clarification question instead of guessing

5. When displaying the household list, always format items as a bullet list.

6. When the user says "What do I need to know?", call get_household_memory and summarize the most important items.

-----------------------------
STRUCTURED MEMORY
-----------------------------

Fields:
- text → short description of the item
- type → appointment | task | grocery | note
- subject → who or what the item relates to
- details → extra context, preparation notes, questions to ask, or reminders
- scheduled_for → ISO datetime when the item happens (YYYY-MM-DDTHH:MM)
- status → usually "active"

IMPORTANT:
If the user provides a natural language time ("tomorrow", "next Tuesday", "tonight at 7"), resolve it into a concrete datetime before storing it.

Examples:

User: "Remember Pascal vet appointment Tuesday at 3"

Store:
text: "Pascal vet appointment"
type: "appointment"
subject: "Pascal"
details: ""
scheduled_for: "2026-03-17T15:00"
status: "active"

User: "Remember Pascal vet appointment Tuesday at 3 and ask about the medication"

Store:
text: "Pascal vet appointment"
type: "appointment"
subject: "Pascal"
details: "Ask about the medication"
scheduled_for: "2026-03-17T15:00"
status: "active"

User: "Remember to buy paper towels tonight at 7"

Store:
text: "Buy paper towels"
type: "grocery"
subject: "paper towels"
details: ""
scheduled_for: "2026-03-15T19:00"
status: "active"

User: "Delete the bread reminder"
Steps:
1. Call get_household_memory
2. Find the matching item with text similar to "bread reminder" or "Get bread"
3. Read its id
4. Call delete_household_memory with that id

Rules:
- scheduled_for must contain the resolved datetime, not the original phrase.
- details must only contain notes or context, never time phrases.
- Do not duplicate time information in both fields.
- If no time is provided, leave scheduled_for empty.
-----------------------------
RESPONSE STYLE
-----------------------------

Stored memory should be concise.

Example:
User: "Remember that we need to buy paper towels"
Stored item: "Buy paper towels"

User: "Remember Pascal vet appointment Tuesday at 3 and ask about the medication"
Stored item text: "Pascal vet appointment"
Stored details: "Ask about the medication"
Stored scheduled_for: "2026-03-17T15:00"

After adding an item, confirm it in one short sentence.

After deleting an item, confirm what was removed.
If you need to delete something, do not pass the item's text directly into the delete tool. Always look up the item first and use its id.

When mentioning dates in responses to the user, format them in a human-friendly way (e.g., "Friday, Mar 20 at 8 AM") instead of the ISO format stored in memory. The ISO format should only be used internally for the scheduled_for field.

Example response format:

Here are your household tasks:

• Buy milk
• Buy paper towels
• Dog vet appointment — Tuesday, Mar 17 at 3 PM
• Pascal needs grooming
• Plumber — Friday, Mar 20 at 8 AM

If there are no household items, say:
"There are no household updates right now."
""",
    tools=[
        get_current_datetime,
        get_household_memory,
        add_household_memory,
        delete_household_memory
    ],
)