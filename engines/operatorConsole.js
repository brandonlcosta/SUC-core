// /engines/operatorConsole.js
import fs from 'fs';
import { createWorld, replaceComponent } from '../ecs/coreEcs.js';

export function createOperatorConsole({ replayWindow = 5 } = {}) {
  const world = createWorld();
  world.addEntity({ queue: { items: [] }, history: { events: [] } });

  world.use((w) => {
    const [ops] = w.get(['queue', 'history']) || [];
    if (!ops) return;
    const item = ops.queue.items.shift();
    if (!item) return;
    switch (item.type) {
      case 'skip': logMetric('ops_skip', item); break;
      case 'advance': logMetric('ops_advance', item); break;
      case 'replay': {
        const last = ops.history.events.slice(-replayWindow);
        emit('replay_bundle', { events: last });
        logMetric('ops_replay', { count: last.length });
        break;
      }
      default: logMetric('ops_unknown', item);
    }
  });

  function enqueue(type, payload = {}) {
    const [ops] = world.get(['queue']) || [];
    if (!ops) return;
    replaceComponent(ops, 'queue', { items: [...ops.queue.items, { type, payload, ts: Date.now() }] });
    world.tick();
  }

  function recordEvent(evt) {
    const [ops] = world.get(['history']) || [];
    if (!ops) return;
    replaceComponent(ops, 'history', { events: [...ops.history.events, evt] });
  }

  return { enqueue, recordEvent };
}

function emit(type, payload) { console.log('[EMIT]', type, JSON.stringify(payload)); }
function logMetric(name, data) {
  try {
    fs.mkdirSync('./outputs/logs', { recursive: true });
    fs.appendFileSync('./outputs/logs/metrics.jsonl', JSON.stringify({ t: Date.now(), name, data }) + '\n');
  } catch (e) {
    console.error('metrics write failed:', e.message);
  }
}
