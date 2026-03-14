import { useEffect, useState } from "react";


type Message = {
  role: "user" | "assistant";
  text: string;
};

type MemoryItem = {
  text: string;
  type: string;
  subject: string;
  details: string;
  scheduled_for: string;
  status: string;
};

function App() {
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hi, I’m Domus. Ask me about your household memory or tell me something to remember.",
    },
  ]);

  const API = "http://127.0.0.1:8000";

  const loadMemory = async () => {
    try {
      const res = await fetch(`${API}/memory`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error("Failed to load memory:", err);
    }
  };


  const deleteMemory = async (text: string) => {
    await fetch(`${API}/memory`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });
    await loadMemory();
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");

    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          user_id: "clarissa",
          session_id: "domus-demo",
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply || "No response from Domus." },
      ]);

      await loadMemory();
    } catch (err) {
      console.error("Chat failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Something went wrong while talking to Domus.",
        },
      ]);
    }
  };

  useEffect(() => {
    loadMemory();
  }, []);

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "32px 24px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "64px",
          marginBottom: "32px",
        }}
      >
        Domus Household Memory
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "20px",
            minHeight: "520px",
            background: "#fff",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Chat</h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginBottom: "20px",
              minHeight: "380px",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  background: msg.role === "user" ? "#111" : "#f3f3f3",
                  color: msg.role === "user" ? "#fff" : "#111",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.5",
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder='Try: "What do I need to know?"'
              style={{
                flex: 1,
                padding: "12px 14px",
                fontSize: "16px",
              }}
            />

            <button
              onClick={handleSend}
              style={{
                padding: "12px 18px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "20px",
            background: "#fff",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Household List</h2>

          <ul
            style={{
              paddingLeft: "24px",
              textAlign: "left",
              lineHeight: "1.8",
            }}
          >
            {items.map((item, i) => (
              <li key={i} style={{ marginBottom: "12px" }}>
                <div>
                  <div>{item.text}</div>
                  <div style={{ fontSize: "13px", opacity: 0.65 }}>
                    {item.type}
                    {item.subject ? ` · ${item.subject}` : ""}
                    {item.details ? ` · ${item.details}` : ""}
                    {item.scheduled_for ? ` · ${item.scheduled_for}` : ""}
                  </div>
                </div>

                <button
                  onClick={() => deleteMemory(item.text)}
                  style={{
                    marginLeft: "12px",
                    cursor: "pointer",
                  }}
                >
                  remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;