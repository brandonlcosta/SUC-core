// /tests/frontendSchema.test.mjs
import { test } from 'node:test';
import assert from 'node:assert';
import { createModeLoader } from '../backend/modeLoader.js';

test('branding.json exposes colors + typography', () => {
  const ml = createModeLoader(process.cwd());
  const branding = ml.get('branding');
  assert.ok(branding.colors.primary, 'branding.colors.primary required');
  assert.ok(branding.typography.display, 'branding.typography.display required');
});
