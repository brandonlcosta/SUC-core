// Resilient client: tries WS → SSE → Polling with backoff.
// Emits normalized events to a callback. Fallback-safe for demos.

export function createEventClient({
  wsUrl = "ws://localhost:4000/events",
  sseUrl = "http://localhost:4000/events/stream",
  pollUrl = "/outputs/events.json",
  pollIntervalMs = 2000,
  onEvent = () => {},
  onStatus = () => {},
} = {}) {
  let ws, es, pollTimer, lastSeenId = null, stopped = false;

  function start() {
    stopped = false;
    tryWS();
  }

  function stop() {
    stopped = true;
    if (ws) { ws.close(); ws = null; }
    if (es) { es.close(); es = null; }
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  }

  function tryWS() {
    if (stopped) return;
    try {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => onStatus({ transport: "ws", status: "connected" });
      ws.onmessage = (m) => handleChunk(m.data);
      ws.onerror = () => { onStatus({ transport: "ws", status: "error" }); ws.close(); };
      ws.onclose = () => { if (!stopped) trySSE(); };
    } catch { trySSE(); }
  }

  function trySSE() {
    if (stopped) return;
    try {
      es = new EventSource(sseUrl, { withCredentials: false });
      onStatus({ transport: "sse", status: "connecting" });
      es.onmessage = (e) => handleChunk(e.data);
      es.onerror = () => { onStatus({ transport: "sse", status: "error" }); es.close(); tryPoll(); };
      es.onopen = () => onStatus({ transport: "sse", status: "connected" });
    } catch { tryPoll(); }
  }

  async function tryPoll() {
    if (stopped) return;
    onStatus({ transport: "poll", status: "connected" });
    pollTimer = setInterval(async () => {
      try {
        const res = await fetch(pollUrl, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json(); // expects array of events
        for (const evt of Array.isArray(data) ? data : []) {
          if (!evt?.event_id) continue;
          if (evt.event_id === lastSeenId) continue;
          lastSeenId = evt.event_id;
          handleEvt(evt);
        }
      } catch (e) {
        onStatus({ transport: "poll", status: "error", error: e?.message });
      }
    }, pollIntervalMs);
  }

  function handleChunk(raw) {
    try {
      const obj = JSON.parse(raw);
      // accept either single event or array
      const list = Array.isArray(obj) ? obj : [obj];
      list.forEach(handleEvt);
    } catch {
      // ignore non-JSON keepalives
    }
  }

  function handleEvt(evt) {
    // Minimal schema guard (Doc 4)
    if (!evt?.event_type || !evt?.timestamp) return;
    onEvent(evt);
  }

  return { start, stop };
}
