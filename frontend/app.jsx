// app.jsx (example)
import StudioDashboard from './frontend/StudioDashboard.jsx';
import hud from './outputs/broadcast/hud.json';
import ticker from './outputs/broadcast/ticker.json';
import recap from './outputs/broadcast/recap.json';
import story from './outputs/broadcast/story.json';

export default function App(){
  return (
    <StudioDashboard
      hud={hud}
      ticker={ticker}
      recap={recap}
      arcs={story.arcs}
      metrics={{ p95_latency_ms: 1200, mode: 'live', events_processed: 2, schema_errors_pct: 0 }}
    />
  );
}
