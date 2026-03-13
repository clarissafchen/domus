import { useEffect, useState } from "react";

function App() {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/memory")
      .then(res => res.json())
      .then(data => setItems(data.items));
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Domus Household Memory</h1>

      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;