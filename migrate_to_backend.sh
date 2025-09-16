#!/usr/bin/env bash
set -euo pipefail

# Create backend structure
mkdir -p backend/{engines,configs,schemas,utils,services,scripts,graph,inputs,outputs,outputs/logs}

# Move directories into backend
mv engines/* backend/engines/ 2>/dev/null || true
mv rulesets/* backend/configs/ 2>/dev/null || true
mv utils/* backend/utils/ 2>/dev/null || true
mv services/* backend/services/ 2>/dev/null || true
mv scripts/* backend/scripts/ 2>/dev/null || true
mv graph/* backend/graph/ 2>/dev/null || true
mv inputs/* backend/inputs/ 2>/dev/null || true
mv outputs/* backend/outputs/ 2>/dev/null || true
mv logs/* backend/outputs/logs/ 2>/dev/null || true

# Remove duplicate graph directory
rm -rf graphs

# Create schema stubs required by playbook
touch backend/schemas/{normalizedEvent.schema.json,ruleset.schema.json,broadcastTick.schema.json,operatorMetrics.schema.json,sponsorImpressions.schema.json}

echo "✅ Migration complete. Run 'tree -L 2 backend' to verify."
