// /suc-core/tests/operatorControls.test.mjs
import { test } from 'node:test';
import assert from 'node:assert';
import { createOperatorControls } from './backend/engines/operatorControls.system.js';


function sampleTick() {
  return {
    ts: Date.now(),
    ticker: [{ text: 'Sample', priority: 1, ts: Date.now() }],
    hud: {
      overlays: [{ type: 'bumper', id: 's1' }, { type: 'bug', id: 'score' }],
      lines: [{ role: 'play_by_play', text: 'A'}, { role: 'analyst', text: 'B'}]
    },
    highlights: {
      arcs: [{ arc_id: 'a1', title: 'Arc 1' }, { arc_id: 'a2', title: 'Arc 2' }]
    },
    recap: { manifest: [] }
  };
}

test('OperatorControls applies PIN_ARC, MUTE_ROLE, SKIP_BUMPER', () => {
  const oc = createOperatorControls({ metricsPath: '/outputs/logs/metrics.jsonl' });
  oc.reduce({ type: 'MUTE_ROLE', payload: { role: 'play_by_play', mute: true } });
  oc.reduce({ type: 'PIN_ARC', payload: { arc_id: 'a2' } });
  oc.reduce({ type: 'SKIP_BUMPER' });

  const out = oc.apply(sampleTick(), Date.now());
  assert.equal(out.hud.overlays.some(o => o.type === 'bumper'), false, 'bumper overlay removed');
  assert.equal(out.highlights.arcs[0].arc_id, 'a2', 'pinned arc moved to front');
  assert.equal(out.hud.lines.some(l => l.role === 'play_by_play'), false, 'muted role filtered');
});
