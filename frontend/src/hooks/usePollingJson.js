import { useState, useEffect } from "react";

export default function usePollingJson(url, intervalMs = 2000) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const response = await fetch(`http://localhost:3001${url}`);
        if (!response.ok) throw new Error("Network error");
        const json = await response.json();
        if (mounted) setData(json);
      } catch (err) {
        console.error("Polling error for", url, err);
      }
    }

    fetchData();
    const id = setInterval(fetchData, intervalMs);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [url, intervalMs]);

  return data;
}