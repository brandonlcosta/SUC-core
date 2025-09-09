/**************************************************
 * backyardCsvAdapter v0.2
 * Purpose: CSV adapter instance for Backyard Ultra feed.
 * Inputs:  { ruleset, source:{type:'string'|'file', data?|path} }
 * Outputs: { connect, fetchEvents(since), disconnect }
 * Notes:   Uses adapterFactory + mapping JSON.
 **************************************************/

import mapping from "../configs/adapterMappings/backyardCsv.mapping.json" with { type: "json" };
import { createAdapterFromMapping } from "../adapterfactory/adapterFactory.js";

export function createBackyardCsvAdapter({ ruleset, source }) {
  return createAdapterFromMapping(mapping, { ruleset, source });
}
