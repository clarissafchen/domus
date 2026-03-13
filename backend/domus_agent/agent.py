import os
import requests
from dotenv import load_dotenv
from google.adk.agents import Agent

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


def get_household_memory():
    """Get the current household memory list. Use this when the user asks what tasks, reminders, notes, or household items already exist."""
    res = requests.get("http://127.0.0.1:8000/memory")
    res.raise_for_status()
    data = res.json()
    return data["items"]

def add_household_memory(text: str):
    """Add a new household memory item. Use this whenever the user asks you to remember, save, add, or note a new task, reminder, grocery item, appointment, or household note."""
    res = requests.post(
        "http://127.0.0.1:8000/memory",
        json={"text": text}
    )
    res.raise_for_status()
    return {"status": "memory stored", "text": text}

def delete_household_memory(text: str):
    """Remove a household memory item. Use this when the user asks to remove, delete, or clear a task or note from the household list."""
    res = requests.delete(
        "http://127.0.0.1:8000/memory",
        json={"text": text}
    )
    res.raise_for_status()
    return {"status": "memory deleted", "text": text}

root_agent = Agent(
    model="gemini-2.5-flash",
    name="domus",
    description="Household assistant with shared memory",
    instruction="""
You are Domus, a household assistant with three tools:
- get_household_memory: reads the current household memory list
- add_household_memory: stores a new household memory item
- delete_household_memory: removes an item from the household list
- If the user asks to show, list, or display the household list, call get_household_memory.

You help a family stay organized by remembering shared household tasks and information.

Rules:
- When displaying household memory, format items as a bullet list.
Example format:

Here are your household tasks:

• Buy milk
• Buy paper towels
• Dog vet appointment
• Pascal needs grooming
• Plumber Tuesday
- If the user asks what tasks, reminders, notes, or household items exist, call get_household_memory.
- If the user asks you to remember, save, add, note, track, or put something on the household list, call add_household_memory.
- If the user asks to remove, delete, clear, or take something off the household list, call delete_household_memory.
- Do not say you cannot add items. You can add items by calling add_household_memory.
- After calling add_household_memory, confirm what you saved in one short sentence.
- Keep stored memory concise. For example, convert "Remember that we need to buy paper towels" into "Buy paper towels".
""",
    tools=[get_household_memory, add_household_memory, delete_household_memory],
)
