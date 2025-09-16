import { createCommentaryEngine } from '../backend/engines/commentaryEngine.js';

test('commentaryEngine generates commentary lines', () => {
  const ce = createCommentaryEngine({});
  const lines = ce.reduce({
    type: 'TICK',
    payload: { ts: Date.now(), arcs: [{ arc_id: 'arc1', arc_type: 'rivalry', priority: 7, beats: [] }] }
  });
  expect(Array.isArray(lines)).toBe(true);
});
