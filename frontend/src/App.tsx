import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("Checking backend...");

  useEffect(() => {
    fetch("http://127.0.0.1:8000")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("Backend unreachable"));
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Domus</h1>
      <p>Backend status: {status}</p>
    </div>
  );
}

export default App;