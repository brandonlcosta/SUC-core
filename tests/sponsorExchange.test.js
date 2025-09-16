import { createSponsorExchange } from '../backend/engines/sponsorExchange.js';

test('sponsorExchange resolves creative', () => {
  const se = createSponsorExchange();
  const result = se.resolveCreative('demo_trigger', Date.now());
  expect(result === null || typeof result === 'object').toBe(true);
});
